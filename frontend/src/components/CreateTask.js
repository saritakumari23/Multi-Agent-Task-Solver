import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, FileText, BarChart3, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const CreateTask = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    description: '',
    workflow_type: 'research_write_review'
  });
  const [loading, setLoading] = useState(false);

  const workflowTypes = [
    {
      id: 'research_write_review',
      name: 'Research → Write → Review',
      description: 'Great for creating awesome content, reports, and deep-dive analysis! 📝',
      icon: FileText,
      color: 'blue'
    },
    {
      id: 'data_analysis',
      name: 'Data Analysis',
      description: 'Perfect for digging into data, finding trends, and uncovering insights! 📊',
      icon: BarChart3,
      color: 'green'
    },
    {
      id: 'custom',
      name: 'Custom Workflow',
      description: 'Let our smart AI agents handle whatever you need! 🤖',
      icon: Settings,
      color: 'purple'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast.error('Hey! Don\'t forget to tell us what you want to work on! 😊');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/tasks', formData);
      
      toast.success('Awesome! Your task is ready to go! 🚀');
      navigate(`/task/${response.data.id}`);
    } catch (error) {
      toast.error('Oops! Something went wrong. Let me try again! 🔄');
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      green: 'border-green-200 bg-green-50 text-green-700',
      purple: 'border-purple-200 bg-purple-50 text-purple-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
          <p className="mt-2 text-gray-600">
            Tell us what you want to work on and we'll make it happen! ✨
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Task Description */}
        <div className="card">
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Task Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="What would you like to work on today? (e.g., 'Write an awesome blog post about the latest AI trends' or 'Create a detailed analysis of renewable energy markets')"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                required
              />
            </div>
            
            <div className="text-sm text-gray-500">
              💡 The more details you give us, the better we can help you create something amazing!
            </div>
          </div>
        </div>

        {/* Workflow Selection */}
        <div className="card">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Choose Workflow Type
              </h3>
              <p className="text-sm text-gray-600">
                Select the workflow that best matches your task requirements
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workflowTypes.map((workflow) => {
                const Icon = workflow.icon;
                const isSelected = formData.workflow_type === workflow.id;
                
                return (
                  <motion.div
                    key={workflow.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                      isSelected
                        ? `border-primary-500 bg-primary-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData({ ...formData, workflow_type: workflow.id })}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-primary-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          isSelected ? 'text-primary-600' : 'text-gray-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          isSelected ? 'text-primary-900' : 'text-gray-900'
                        }`}>
                          {workflow.name}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          isSelected ? 'text-primary-700' : 'text-gray-600'
                        }`}>
                          {workflow.description}
                        </p>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="h-2 w-2 bg-primary-600 rounded-full"></div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="card">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Example Tasks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Research → Write → Review</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• "Write a blog post about renewable energy trends"</li>
                  <li>• "Create a market analysis report for electric vehicles"</li>
                  <li>• "Research and write about AI ethics in healthcare"</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Data Analysis</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• "Analyze sales data for Q4 performance"</li>
                  <li>• "Process customer feedback and generate insights"</li>
                  <li>• "Create a financial forecast based on historical data"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Cancel
          </button>
          
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Getting everything ready...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Let's Go! 🚀</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;
