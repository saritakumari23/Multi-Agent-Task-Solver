import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Play, 
  XCircle,
  Copy,
  Download,
  Share2,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

const TaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(true);
  const [expandedSubtask, setExpandedSubtask] = useState(null);

  // WebSocket connection for real-time updates
  const { lastMessage, connectionStatus } = useWebSocket(`wss://multi-agent-task-solver.onrender.com/ws/tasks/${taskId}`);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  useEffect(() => {
    if (lastMessage) {
      handleWebSocketMessage(lastMessage);
    }
  }, [lastMessage]);

  const fetchTaskDetails = async () => {
    try {
      const [taskResponse, subtasksResponse] = await Promise.all([
        api.get(`/api/tasks/${taskId}?t=${Date.now()}`),
        api.get(`/api/tasks/${taskId}/subtasks?t=${Date.now()}`)
      ]);
      
      console.log("Task response:", taskResponse.data);
      setTask(taskResponse.data);
      setSubtasks(subtasksResponse.data);
    } catch (error) {
      toast.error('Failed to fetch task details');
      console.error('Error fetching task details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWebSocketMessage = (message) => {
    try {
      const data = JSON.parse(message.data);
      
      switch (data.type) {
        case 'task_started':
          setTask(prev => ({ ...prev, status: 'running' }));
          toast.success('Task execution started');
          break;
          
        case 'subtask_started':
          setSubtasks(prev => prev.map(subtask => 
            subtask.id === data.subtask_id 
              ? { ...subtask, status: 'running', started_at: data.timestamp }
              : subtask
          ));
          break;
          
        case 'subtask_completed':
          setSubtasks(prev => prev.map(subtask => 
            subtask.id === data.subtask_id 
              ? { ...subtask, status: 'completed', completed_at: data.timestamp }
              : subtask
          ));
          break;
          
        case 'subtask_failed':
          setSubtasks(prev => prev.map(subtask => 
            subtask.id === data.subtask_id 
              ? { ...subtask, status: 'failed', error_message: data.message }
              : subtask
          ));
          break;
          
        case 'task_progress':
          setTask(prev => ({ ...prev, progress: data.progress }));
          break;
          
        case 'task_completed':
          setTask(prev => ({ 
            ...prev, 
            status: 'completed', 
            progress: 100,
            final_output: JSON.stringify(data.data)
          }));
          toast.success('Task completed successfully!');
          break;
          
        case 'task_failed':
          setTask(prev => ({ ...prev, status: 'failed' }));
          toast.error('Task failed');
          break;
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-500" />;
      case 'running':
        return <Play className="h-5 w-5 text-warning-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-danger-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'running':
        return 'status-running';
      case 'completed':
        return 'status-completed';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-pending';
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadContent = () => {
    if (!task?.final_output) return;
    
    try {
      const data = JSON.parse(task.final_output);
      const content = data.final_content || 'No content available';
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `task-${taskId}-output.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Content downloaded');
    } catch (error) {
      toast.error('Failed to download content');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <XCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Task not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The task you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Details</h1>
            <p className="mt-2 text-gray-600">{task.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`status-badge ${getStatusColor(task.status)}`}>
            {getStatusIcon(task.status)}
            <span className="ml-1">{task.status}</span>
          </span>
          
          <button
            onClick={fetchTaskDetails}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          
          {connectionStatus === 'Connected' && (
            <div className="flex items-center text-sm text-success-600">
              <div className="h-2 w-2 bg-success-500 rounded-full animate-pulse mr-2"></div>
              Live
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Progress</h3>
            <span className="text-sm text-gray-600">{task.progress}%</span>
          </div>
          
          <div className="progress-bar">
            <motion.div 
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${task.progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Subtasks */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Task Execution</h3>
        
        <div className="space-y-4">
          {subtasks.map((subtask, index) => (
            <motion.div
              key={subtask.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                subtask.status === 'running' 
                  ? 'border-warning-200 bg-warning-50' 
                  : subtask.status === 'completed'
                  ? 'border-success-200 bg-success-50'
                  : subtask.status === 'failed'
                  ? 'border-danger-200 bg-danger-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(subtask.status)}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {subtask.agent_name}
                    </h4>
                    <p className="text-sm text-gray-600">{subtask.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`status-badge ${getStatusColor(subtask.status)}`}>
                    {subtask.status}
                  </span>
                  
                  {subtask.status === 'running' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-warning-600"></div>
                  )}
                  
                  {subtask.output_data && (
                    <button
                      onClick={() => setExpandedSubtask(
                        expandedSubtask === subtask.id ? null : subtask.id
                      )}
                      className="p-1 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                    >
                      {expandedSubtask === subtask.id ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              {subtask.status === 'failed' && subtask.error_message && (
                <div className="mt-3 p-3 bg-danger-100 border border-danger-200 rounded-md">
                  <p className="text-sm text-danger-800">{subtask.error_message}</p>
                </div>
              )}
              
              <AnimatePresence>
                {expandedSubtask === subtask.id && subtask.output_data && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-white border border-gray-200 rounded-md"
                  >
                    <h5 className="font-medium text-gray-900 mb-2">Output Data</h5>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(JSON.parse(subtask.output_data), null, 2)}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Results */}
      {task.status === 'completed' && task.final_output && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Final Results</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowResults(!showResults)}
                className="btn-secondary flex items-center space-x-2"
              >
                {showResults ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showResults ? 'Hide' : 'Show'} Results</span>
              </button>
              
              <button
                onClick={() => copyToClipboard(JSON.parse(task.final_output).final_content)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </button>
              
              <button
                onClick={downloadContent}
                className="btn-primary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
          
          {showResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose max-w-none"
            >
              <div className="bg-gray-50 p-6 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800">
                  {(() => {
                    try {
                      const finalOutput = JSON.parse(task.final_output);
                      console.log("Final output:", finalOutput);
                      console.log("Final content:", finalOutput.final_content);
                      return finalOutput.final_content || "No content available";
                    } catch (error) {
                      console.error("Error parsing final output:", error);
                      return "Error displaying results";
                    }
                  })()}
                </pre>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default TaskDetails;
