import asyncio
import json
import random
import time
from typing import Dict, Any, List
from datetime import datetime
import logging

from schemas import ExecutionContext, AgentResult

logger = logging.getLogger(__name__)

class BaseAgent:
    """Base class for all agents"""
    
    def __init__(self, name: str):
        self.name = name
    
    async def execute(self, context: ExecutionContext) -> AgentResult:
        """Execute the agent's task"""
        start_time = time.time()
        
        try:
            # Simulate some processing time
            await asyncio.sleep(random.uniform(1, 3))
            
            # Get the main task description
            task_description = context.shared_context.get("description", "")
            
            # Process the task
            result_data = await self._process_task(task_description, context.input_data)
            
            execution_time = time.time() - start_time
            
            return AgentResult(
                success=True,
                data=result_data,
                execution_time=execution_time
            )
            
        except Exception as e:
            logger.error(f"Agent {self.name} failed: {e}")
            return AgentResult(
                success=False,
                error=str(e),
                execution_time=time.time() - start_time
            )
    
    async def _process_task(self, task_description: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Override this method in subclasses"""
        raise NotImplementedError

class ResearchAgent(BaseAgent):
    """Agent responsible for research and information gathering"""
    
    def __init__(self):
        super().__init__("Research Agent")
    
    async def _process_task(self, task_description: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate research process"""
        
        # Simulate research based on task description
        if "tesla" in task_description.lower() and "rivian" in task_description.lower():
            sources = [
                "Tesla Annual Report 2023",
                "Rivian IPO Prospectus",
                "EV Market Analysis - Bloomberg",
                "Automotive Industry Report - McKinsey"
            ]
            summary = "Comprehensive research on Tesla vs Rivian covering financial performance, market position, technology, and competitive advantages."
            key_points = [
                "Tesla leads in EV market share with 20% globally",
                "Rivian focuses on electric trucks and commercial vehicles",
                "Tesla has superior charging infrastructure (Supercharger network)",
                "Rivian has strong backing from Amazon and Ford",
                "Both companies face supply chain challenges"
            ]
        elif "electric vehicle" in task_description.lower():
            sources = [
                "Global EV Outlook 2023 - IEA",
                "Electric Vehicle Market Trends - Deloitte",
                "Battery Technology Advances - Nature Energy",
                "Charging Infrastructure Report - DOE"
            ]
            summary = "Research on electric vehicle market trends, technology developments, and future outlook."
            key_points = [
                "Global EV sales grew 55% in 2022",
                "Battery costs have decreased 89% since 2010",
                "Charging infrastructure is expanding rapidly",
                "Government incentives are driving adoption"
            ]
        else:
            sources = [
                f"Latest insights on: {task_description}",
                f"Expert analysis: {task_description}",
                f"Industry trends: {task_description}"
            ]
            summary = f"I've been exploring {task_description} and found some really interesting developments worth sharing!"
            key_points = [
                f"Here's something fascinating about {task_description}",
                f"Another exciting aspect of {task_description}",
                f"This is particularly interesting about {task_description}"
            ]
        
        return {
            "sources": sources,
            "summary": summary,
            "key_points": key_points,
            "research_date": datetime.utcnow().isoformat(),
            "confidence_score": random.uniform(0.8, 0.95)
        }

class WriterAgent(BaseAgent):
    """Agent responsible for content creation and writing"""
    
    def __init__(self):
        super().__init__("Writer Agent")
    
    async def _process_task(self, task_description: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate writing process"""
        
        # Get research data from input
        research_data = None
        for subtask_id, data in input_data.items():
            if isinstance(data, dict) and "sources" in data:
                research_data = data
                break
        
        if not research_data:
            research_data = {
                "sources": ["General research sources"],
                "summary": f"General information about {task_description}",
                "key_points": ["Point 1", "Point 2", "Point 3"]
            }
        
        # Generate content based on research
        if "tesla" in task_description.lower() and "rivian" in task_description.lower():
            content = self._generate_tesla_vs_rivian_content(research_data)
        elif "electric vehicle" in task_description.lower():
            content = self._generate_ev_content(research_data)
        else:
            content = self._generate_general_content(task_description, research_data)
        
        return {
            "content": content,
            "word_count": len(content.split()),
            "sections": self._extract_sections(content),
            "writing_style": "professional",
            "created_at": datetime.utcnow().isoformat()
        }
    
    def _generate_tesla_vs_rivian_content(self, research_data: Dict[str, Any]) -> str:
        """Generate Tesla vs Rivian comparison content"""
        return f"""
# Tesla vs Rivian: A Comprehensive Comparison

## Executive Summary
{research_data.get('summary', 'Analysis of Tesla and Rivian in the electric vehicle market.')}

## Market Position

### Tesla
- **Market Share**: Leading global EV manufacturer with approximately 20% market share
- **Strengths**: 
  - Extensive Supercharger network
  - Advanced autonomous driving technology
  - Strong brand recognition
  - Vertical integration in manufacturing

### Rivian
- **Market Focus**: Electric trucks and commercial vehicles
- **Strengths**:
  - Strategic partnerships with Amazon and Ford
  - Focus on adventure and utility vehicles
  - Strong financial backing
  - Innovative vehicle design

## Financial Performance

### Tesla
- Revenue: $81.5 billion (2022)
- Net Income: $12.6 billion
- Market Cap: $800+ billion
- Production: 1.37 million vehicles (2022)

### Rivian
- Revenue: $1.66 billion (2022)
- Net Loss: $6.75 billion
- Market Cap: $15+ billion
- Production: 24,337 vehicles (2022)

## Technology Comparison

### Battery Technology
- **Tesla**: Proprietary battery technology, 4680 cells
- **Rivian**: Standard battery packs, focus on durability

### Charging Infrastructure
- **Tesla**: 40,000+ Superchargers globally
- **Rivian**: Partnering with existing networks, building Rivian Adventure Network

## Key Findings
{chr(10).join(f"- {point}" for point in research_data.get('key_points', []))}

## Conclusion
Both companies are positioned for success in the growing EV market, with Tesla having the advantage of scale and infrastructure, while Rivian focuses on niche markets with strong backing.

*Sources: {', '.join(research_data.get('sources', []))}*
"""
    
    def _generate_ev_content(self, research_data: Dict[str, Any]) -> str:
        """Generate general EV content"""
        return f"""
# Electric Vehicle Market Analysis

## Market Overview
{research_data.get('summary', 'The electric vehicle market is absolutely booming right now! Let me break down what\'s happening in this exciting space.')}

## Key Market Trends

### Growth Statistics
- Global EV sales increased by 55% in 2022 (that's incredible growth!)
- Battery costs have decreased by 89% since 2010 (making EVs more affordable)
- Charging infrastructure is expanding rapidly (no more range anxiety!)

### Technology Developments
- Improved battery density and range (you can go further on a single charge)
- Faster charging capabilities (grab a coffee and you're ready to go)
- Enhanced autonomous driving features (the future is here!)

## Market Drivers
{chr(10).join(f"- {point}" for point in research_data.get('key_points', []))}

## Future Outlook
The electric vehicle market is on fire and shows no signs of slowing down! With government incentives, growing environmental awareness, and amazing technological advances, we're witnessing a transportation revolution.

*Sources: {', '.join(research_data.get('sources', []))}*
"""
    
    def _generate_general_content(self, task_description: str, research_data: Dict[str, Any]) -> str:
        """Generate general content based on task description"""
        return f"""
# {task_description.title()}

## Overview
{research_data.get('summary', f'Let me share some insights about {task_description.lower()} that you might find valuable.')}

## Key Points
{chr(10).join(f"- {point}" for point in research_data.get('key_points', []))}

## Analysis
After diving deep into this topic, I've discovered some fascinating aspects that are worth exploring further. The research reveals several interesting patterns and opportunities that could be valuable for anyone interested in this area.

## Conclusion
{task_description} is truly an exciting field with lots of potential for growth and innovation. Whether you're just getting started or looking to deepen your understanding, there's always something new to discover.

*Sources: {', '.join(research_data.get('sources', []))}*
"""
    
    def _extract_sections(self, content: str) -> List[str]:
        """Extract section headers from content"""
        sections = []
        for line in content.split('\n'):
            if line.startswith('#'):
                sections.append(line.strip('# '))
        return sections

class ReviewerAgent(BaseAgent):
    """Agent responsible for content review and quality improvement"""
    
    def __init__(self):
        super().__init__("Reviewer Agent")
    
    async def _process_task(self, task_description: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate review process"""
        
        # Get written content from input
        written_content = None
        for subtask_id, data in input_data.items():
            if isinstance(data, dict) and "content" in data:
                written_content = data
                break
        
        if not written_content:
            written_content = {
                "content": f"Content about {task_description}",
                "word_count": 100,
                "sections": ["Introduction", "Conclusion"]
            }
        
        # Perform review
        review_results = self._review_content(written_content["content"])
        
        # Generate improved content
        improved_content = self._improve_content(written_content["content"], review_results)
        
        return {
            "original_content": written_content["content"],
            "improved_content": improved_content,
            "review_feedback": review_results,
            "quality_score": self._calculate_quality_score(improved_content),
            "improvements_made": self._get_improvements_made(written_content["content"], improved_content),
            "reviewed_at": datetime.utcnow().isoformat()
        }
    
    def _review_content(self, content: str) -> Dict[str, Any]:
        """Review content and provide feedback"""
        word_count = len(content.split())
        
        feedback = {
            "clarity_score": random.uniform(0.7, 0.95),
            "structure_score": random.uniform(0.8, 0.95),
            "completeness_score": random.uniform(0.75, 0.9),
            "suggestions": []
        }
        
        # Generate suggestions based on content
        if word_count < 200:
            feedback["suggestions"].append("Consider adding more detail and examples")
        
        if "conclusion" not in content.lower():
            feedback["suggestions"].append("Add a clear conclusion section")
        
        if content.count("#") < 2:
            feedback["suggestions"].append("Improve structure with more headings")
        
        if not any(word in content.lower() for word in ["data", "statistics", "research"]):
            feedback["suggestions"].append("Include more data and research findings")
        
        return feedback
    
    def _improve_content(self, content: str, review_feedback: Dict[str, Any]) -> str:
        """Improve content based on review feedback"""
        improved = content
        
        # Add improvements based on suggestions
        if "more detail" in str(review_feedback.get("suggestions", [])):
            improved += "\n\n## Additional Insights\nI've added some extra details that I think you'll find really helpful. This gives a more complete picture of what we're looking at."
        
        if "conclusion" not in improved.lower():
            improved += "\n\n## Final Thoughts\nTo wrap this up, I wanted to share some final thoughts that tie everything together nicely. This topic is really fascinating and there's so much more to explore!"
        
        return improved
    
    def _calculate_quality_score(self, content: str) -> float:
        """Calculate quality score for content"""
        base_score = random.uniform(0.8, 0.95)
        
        # Adjust based on content characteristics
        if len(content.split()) > 300:
            base_score += 0.05
        if content.count("#") >= 3:
            base_score += 0.03
        if any(word in content.lower() for word in ["data", "research", "analysis"]):
            base_score += 0.02
        
        return min(1.0, base_score)
    
    def _get_improvements_made(self, original: str, improved: str) -> List[str]:
        """Get list of improvements made"""
        improvements = []
        
        if len(improved.split()) > len(original.split()):
            improvements.append("Added more detailed content")
        
        if improved.count("#") > original.count("#"):
            improvements.append("Improved structure with additional headings")
        
        if "conclusion" in improved.lower() and "conclusion" not in original.lower():
            improvements.append("Added conclusion section")
        
        if not improvements:
            improvements.append("Enhanced clarity and readability")
        
        return improvements

class DataAgent(BaseAgent):
    """Agent responsible for data collection and processing"""
    
    def __init__(self):
        super().__init__("Data Agent")
    
    async def _process_task(self, task_description: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate data collection process"""
        
        # Simulate data collection
        datasets = [
            {"name": "Primary Dataset", "records": random.randint(1000, 10000), "quality": "high"},
            {"name": "Secondary Dataset", "records": random.randint(500, 5000), "quality": "medium"},
            {"name": "Reference Dataset", "records": random.randint(100, 1000), "quality": "high"}
        ]
        
        return {
            "datasets": datasets,
            "total_records": sum(ds["records"] for ds in datasets),
            "data_quality_score": random.uniform(0.8, 0.95),
            "collection_method": "API and web scraping",
            "collected_at": datetime.utcnow().isoformat()
        }

class AnalysisAgent(BaseAgent):
    """Agent responsible for data analysis"""
    
    def __init__(self):
        super().__init__("Analysis Agent")
    
    async def _process_task(self, task_description: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate data analysis process"""
        
        # Get data from input
        data_info = None
        for subtask_id, data in input_data.items():
            if isinstance(data, dict) and "datasets" in data:
                data_info = data
                break
        
        if not data_info:
            data_info = {"total_records": 1000, "data_quality_score": 0.9}
        
        # Simulate analysis
        analysis_results = {
            "summary_statistics": {
                "mean": random.uniform(50, 100),
                "median": random.uniform(45, 95),
                "std_dev": random.uniform(10, 25)
            },
            "trends": [
                "Positive growth trend observed",
                "Seasonal variations detected",
                "Correlation with external factors identified"
            ],
            "insights": [
                "Data shows strong correlation between variables",
                "Outliers identified and analyzed",
                "Predictive model accuracy: 87%"
            ],
            "visualizations": [
                "Line chart showing trends over time",
                "Scatter plot of key variables",
                "Histogram of data distribution"
            ],
            "confidence_level": random.uniform(0.85, 0.95),
            "analysis_date": datetime.utcnow().isoformat()
        }
        
        return analysis_results

class AgentRegistry:
    """Registry for managing all available agents"""
    
    def __init__(self):
        self.agents = {
            "Research Agent": ResearchAgent(),
            "Writer Agent": WriterAgent(),
            "Reviewer Agent": ReviewerAgent(),
            "Data Agent": DataAgent(),
            "Analysis Agent": AnalysisAgent(),
            "General Agent": ResearchAgent()  # Fallback for custom workflows
        }
    
    def get_agent(self, agent_name: str) -> BaseAgent:
        """Get an agent by name"""
        return self.agents.get(agent_name)
    
    def list_agents(self) -> List[str]:
        """List all available agents"""
        return list(self.agents.keys())
