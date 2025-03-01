import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logger from '../utils/logger';
import { CircularProgress } from '@mui/material';

const NewPage = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const projectId = localStorage.getItem('projectId');

  const getDeploymentInstanceIP = async () => {
    try {
      const jobStatusResponse = await axios.get(`http://localhost:8080/job/FMD/lastBuild/consoleText`, {
        auth: {
          username: 'admin',
          password: '1196611b0d87af2b9d9df124ec2d755b21'
        }
      });
    
    const text = jobStatusResponse.data;
    
    // Regex to extract IP from "EC2 Instance Public IP: xxx.xxx.xxx.xxx"
    const match = text.match(/EC2 Instance Public IP:\s+([\d.]+)/);
    
    if (match) {
        const ec2PublicIP = match[1];
        console.log("Extracted EC2 Public IP:", ec2PublicIP);
        return ec2PublicIP;
    } else {
        console.error("EC2 Public IP not found in the logs.");
        return null;
    }
    } catch (error) {
      logger.error('Error getting deployment instance IP:', error);
      return null;
    }
  };
    

  useEffect(() => {
    const triggerJenkinsJob = async () => {
      try {
        logger.info('Fetching Jenkins crumb');
        const crumbResponse = await axios.get('http://localhost:8080/crumbIssuer/api/json', {
          auth: {
            username: 'admin',
            password: '1196611b0d87af2b9d9df124ec2d755b21'
          }
        });
        const crumb = crumbResponse.data.crumb;
        const crumbField = crumbResponse.data.crumbRequestField;

        logger.info('Fetched Jenkins crumb');

        await axios.post(`http://localhost:8080/job/FMD/buildWithParameters?token=token&PROJECT_ID=${projectId}&AUTH_TOKEN=${localStorage.getItem('token')}`, {}, {
            headers: {
              [crumbField]: crumb
            },
            auth: {
              username: 'admin',
              password: '1196611b0d87af2b9d9df124ec2d755b21'
            }
          });

        logger.info('Triggered Jenkins job');

        // Add a delay to ensure we get the latest job
        await new Promise(resolve => setTimeout(resolve, 10000));

        const buildNumberResponse = await axios.get('http://localhost:8080/job/FMD/api/json', {
          auth: {
            username: 'admin',
            password: '1196611b0d87af2b9d9df124ec2d755b21'
          }
        });
        const buildNumber = buildNumberResponse.data.lastBuild.number;

        logger.info(`Fetched build number: ${buildNumber}`);

        const checkJobStatus = async () => {
          const jobStatusResponse = await axios.get(`http://localhost:8080/job/FMD/${buildNumber}/api/json`, {
            auth: {
              username: 'admin',
              password: '1196611b0d87af2b9d9df124ec2d755b21'
            }
          });
          if (!jobStatusResponse.data.inProgress) {
            clearInterval(intervalId);
            setLoading(false);
            if (jobStatusResponse.data.result === 'SUCCESS') {
              const ec2PublicIP = await getDeploymentInstanceIP();
              if (ec2PublicIP) {
                await axios.put(`http://localhost:5000/api/v1/projects/${projectId}`, { ec2PublicIP }, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
                });
                setStatus(`Job completed successfully! Deployed at IP: ${ec2PublicIP}`);
              } else {
                setStatus('Job completed successfully, but failed to retrieve IP.');
              }
              logger.info('Job completed successfully');
              
              // Update project status to success
            } else {
              setStatus('Job failed.');
              logger.error('Job failed');
              // Update project status to failure
            }
          }
        };

        const intervalId = setInterval(checkJobStatus, 10000); // Check every 10 seconds
        setTimeout(() => {
          clearInterval(intervalId);
          setLoading(false);
          setStatus('Job timed out.');
          logger.error('Job timed out');
        }, 600000); // Timeout after 10 minutes
      } catch (error) {
        logger.error('Error triggering Jenkins job:', error);
        setStatus('Error triggering Jenkins job.');
        setLoading(false);
      }
    };

    if (projectId) {
      triggerJenkinsJob();
    } else {
      setLoading(false);
      setStatus('No project ID found. Cannot trigger job.');
    }
  }, [projectId]);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Job Status</h1>
      {loading ? (
        <div>
          <p className="text-lg text-gray-700 dark:text-gray-300">Job is in progress...</p>
          <CircularProgress />
        </div>
      ) : (
        <p className="text-lg text-gray-700 dark:text-gray-300">{status}</p>
      )}
    </div>
  );
};

export default NewPage;
