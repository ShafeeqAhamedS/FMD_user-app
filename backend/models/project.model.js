const db = require('../utils/db');

const Project = {
  // Create a new project
  create: function(projectData) {
    // Parse tags if provided as string
    if (projectData.tags && typeof projectData.tags === 'string') {
      projectData.tags = JSON.parse(projectData.tags);
    }
    
    // Set default values
    projectData.status = projectData.status || 'draft';
    projectData.tags = projectData.tags || [];
    
    // Create project in database
    return db.create('projects', projectData);
  },
  
  // Find a project by ID
  findById: function(id) {
    return db.findById('projects', id);
  },
  
  // Find projects by filter
  find: function(filter) {
    return db.find('projects', filter);
  },
  
  // Update a project
  findByIdAndUpdate: function(id, updates) {
    // Parse tags if provided as string
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = JSON.parse(updates.tags);
    }
    
    return db.update('projects', id, updates);
  },
  
  // Delete a project
  findByIdAndDelete: function(id) {
    return db.remove('projects', id);
  },
  
  // Save project (for updates)
  save: function(project) {
    return db.update('projects', project._id, project);
  }
};

module.exports = Project;
