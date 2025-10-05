import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity as ActivityIcon, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play,
  Bot,
  TrendingUp,
  Users
} from 'lucide-react';
import { api } from '../services/api';

const Activity = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    runningTasks: 0,
    failedTasks: 0
  });

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const response = await api.get('/api/tasks');
      setTasks(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const completed = response.data.filter(task => task.status === 'completed').length;
      const running = response.data.filter(task => task.status === 'running').length;
      const failed = response.data.filter(task => task.status === 'failed').length;
      
      setStats({
        totalTasks: total,
        completedTasks: completed,
        runningTasks: running,
        failedTasks: failed
      });
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-warning-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-danger-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-gray-600';
      case 'running':
        return 'text-warning-600';
      case 'completed':
        return 'text-success-600';
      case 'failed':
        return 'text-danger-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Feed</h1>
        <p className="mt-2 text-gray-600">
          Monitor system activity and task execution
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <ActivityIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Play className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Running</p>
              <p className="text-2xl font-bold text-gray-900">{stats.runningTasks}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-danger-100 rounded-lg">
              <XCircle className="h-6 w-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failedTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <div className="text-sm text-gray-500">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <ActivityIcon className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first task to see activity here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(task.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {task.description}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Workflow: {task.workflow_type}</span>
                      <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                      <span className={`font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {task.status === 'running' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{task.progress}%</span>
                    </div>
                  )}
                  
                  {task.status === 'completed' && (
                    <div className="flex items-center text-success-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Completed</span>
                    </div>
                  )}
                  
                  {task.status === 'failed' && (
                    <div className="flex items-center text-danger-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Failed</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* System Status */}
      <div className="card">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">System Status</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Execution Engine</span>
              <span className="text-sm font-medium text-success-600">Online</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">WebSocket Server</span>
              <span className="text-sm font-medium text-success-600">Connected</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Database</span>
              <span className="text-sm font-medium text-success-600">Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;
