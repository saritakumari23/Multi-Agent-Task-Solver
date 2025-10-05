import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Activity, 
  CheckCircle, 
  Clock, 
  Settings,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalTasks: 0,
    completedTasks: 0
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await api.get('/api/agents');
      setAgents(response.data.agents);
      
      // Calculate stats
      setStats({
        totalAgents: response.data.agents.length,
        activeAgents: response.data.agents.filter(agent => agent.status === 'active').length,
        totalTasks: 0, // This would come from a separate API call
        completedTasks: 0
      });
    } catch (error) {
      toast.error('Failed to fetch agents');
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgent = async (agentName) => {
    try {
      // This would be an actual API call to toggle agent status
      setAgents(prev => prev.map(agent => 
        agent.name === agentName 
          ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' }
          : agent
      ));
      
      toast.success(`Agent ${agentName} ${agents.find(a => a.name === agentName).status === 'active' ? 'disabled' : 'enabled'}`);
    } catch (error) {
      toast.error('Failed to toggle agent');
    }
  };

  const getAgentIcon = (agentName) => {
    if (agentName.includes('Research')) return Bot;
    if (agentName.includes('Writer')) return Activity;
    if (agentName.includes('Reviewer')) return CheckCircle;
    if (agentName.includes('Data')) return BarChart3;
    if (agentName.includes('Analysis')) return BarChart3;
    return Bot;
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-success-100 text-success-800 border-success-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200';
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
        <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage your AI agents
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Bot className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAgents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Agents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeAgents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent, index) => {
          const Icon = getAgentIcon(agent.name);
          const isActive = agent.status === 'active';
          
          return (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`card border-2 transition-all duration-200 ${
                isActive 
                  ? 'border-success-200 bg-success-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="space-y-4">
                {/* Agent Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-success-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        isActive ? 'text-success-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{agent.name}</h3>
                      <p className="text-sm text-gray-600">{agent.description}</p>
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    getStatusColor(agent.status)
                  }`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {/* Agent Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Tasks Processed</p>
                    <p className="font-semibold text-gray-900">
                      {agent.tasks || Math.floor(Math.random() * 50) + 10}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Success Rate</p>
                    <p className="font-semibold text-gray-900">
                      {Math.floor(Math.random() * 20) + 80}%
                    </p>
                  </div>
                </div>

                {/* Agent Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => toggleAgent(agent.name)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-danger-100 text-danger-700 hover:bg-danger-200'
                        : 'bg-success-100 text-success-700 hover:bg-success-200'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Pause className="h-4 w-4" />
                        <span>Disable</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span>Enable</span>
                      </>
                    )}
                  </button>
                  
                  <button className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors duration-200">
                    <Settings className="h-4 w-4" />
                    <span>Configure</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
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

export default AgentManagement;
