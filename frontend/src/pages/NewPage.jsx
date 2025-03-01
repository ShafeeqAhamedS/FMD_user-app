import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logger, { log } from '../utils/logger';
import { CircularProgress } from '@mui/material';

const NewPage = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());
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
    const checkDeploymentStatus = async () => {
      try {
        // Get the latest build info
        const buildNumber = localStorage.getItem('buildNumber');
        logger.info(`Checking build number: ${buildNumber}`);

        const checkJobStatus = async () => {
          const jobStatusResponse = await axios.get(`http://localhost:8080/job/FMD/${buildNumber}/api/json`, {
            auth: {
              username: 'admin',
              password: '1196611b0d87af2b9d9df124ec2d755b21'
            }
          });
          logger.info('Job status:', jobStatusResponse.data.inProgress ? 'In progress' : 'Completed');
          if (!jobStatusResponse.data.inProgress) {
            clearInterval(intervalId);
            setLoading(false);
            if (jobStatusResponse.data.result === 'SUCCESS') {
              const ec2PublicIP = await getDeploymentInstanceIP();
              if (ec2PublicIP) {
                await axios.put(`http://localhost:5000/api/v1/projects/${projectId}`, { 
                  ec2PublicIP, 
                  status: 'deployed'
                }, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
                });
                setStatus(`Job completed successfully! Deployed at IP: ${ec2PublicIP}`);
              } else {
                await axios.put(`http://localhost:5000/api/v1/projects/${projectId}`, { 
                  status: 'failed'
                }, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
                });
                setStatus('Job completed successfully, but failed to retrieve IP.');
              }
              logger.info('Job completed successfully');
            } else {
              await axios.put(`http://localhost:5000/api/v1/projects/${projectId}`, { 
                status: 'failed'
              }, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              });
              setStatus('Job failed.');
              logger.error('Job failed');
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
        logger.error('Error checking deployment status:', error);
        setStatus('Error checking deployment status.');
        setLoading(false);
      }
    };

    if (projectId) {
      const initializeDeployment = async () => {
        try {
          // Set initial status to processing
          await axios.put(`http://localhost:5000/api/v1/projects/${projectId}`, { 
            status: 'processing'
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          checkDeploymentStatus();
        } catch (error) {
          logger.error('Error initializing deployment:', error);
          setStatus('Error starting deployment process.');
          setLoading(false);
        }
      };
      initializeDeployment();
    } else {
      setLoading(false);
      setStatus('No project ID found. Cannot check deployment status.');
    }
  }, [projectId]);

  useEffect(() => {
    let timerInterval;
    if (loading) {
      timerInterval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [loading, startTime]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Deployment Status</h1>
      {loading ? (
        <div className="space-y-4">
          <p className="text-lg text-gray-700 dark:text-gray-300">Checking deployment status...</p>
          <div className="flex items-center gap-4">
            <CircularProgress />
            <span className="text-lg font-mono">{formatTime(elapsedTime)}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-lg text-gray-700 dark:text-gray-300">{status}</p>
          <p className="text-md text-gray-600 dark:text-gray-400">Total time: {formatTime(elapsedTime)}</p>
        </div>
      )}
    </div>
  );
};

export default NewPage;
