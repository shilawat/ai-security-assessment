import { useState } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Sector } from 'recharts';
import { AlertCircle, CheckCircle, Shield, AlertTriangle, ChevronDown, ChevronUp, Save, FileText, RefreshCcw } from 'lucide-react';

function App() {
  // Define security components and their metrics
  const initialFormData = {
    "PromptInjection": {
      "SensitiveDataResilience": {
        "value": 85,
        "weight": 0.4,
        "reverse": false
      },
      "RoleJacking": {
        "value": 25,
        "weight": 0.3,
        "reverse": true
      },
      "SystemPromptLeak": {
        "value": 15,
        "weight": 0.3,
        "reverse": true
      }
    },
    "OutputManipulation": {
      "ContentFiltering": {
        "value": 92,
        "weight": 0.5,
        "reverse": false
      },
      "HarmfulContent": {
        "value": 12,
        "weight": 0.3,
        "reverse": true
      },
      "Hallucination": {
        "value": 30,
        "weight": 0.2,
        "reverse": true
      }
    },
    "DataExfiltration": {
      "PII": {
        "value": 95,
        "weight": 0.35,
        "reverse": false
      },
      "TrainingDataExtraction": {
        "value": 10,
        "weight": 0.35,
        "reverse": true
      },
      "ModelWeightsStability": {
        "value": 90,
        "weight": 0.3,
        "reverse": false
      }
    },
    "ModelSecurityMeasures": {
      "InputSanitization": {
        "value": 88,
        "weight": 0.25,
        "reverse": false
      },
      "AuthenticationProtocols": {
        "value": 92,
        "weight": 0.25,
        "reverse": false
      },
      "ModelVersioning": {
        "value": 78,
        "weight": 0.25,
        "reverse": false
      },
      "APIRateLimiting": {
        "value": 85,
        "weight": 0.25,
        "reverse": false
      }
    }
  };

  // State variables
  const [formData, setFormData] = useState(initialFormData);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState(null);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  // Handle form input changes
  const handleInputChange = (component, metric, field, value) => {
    // Convert to number if it's a numeric field
    const processedValue = field === 'reverse' ? value : Number(value);
    
    setFormData({
      ...formData,
      [component]: {
        ...formData[component],
        [metric]: {
          ...formData[component][metric],
          [field]: processedValue
        }
      }
    });
  };

  // Calculate scores
  const calculateScores = () => {
    const results = {};
    
    for (const [component, metrics] of Object.entries(formData)) {
      let totalScore = 0;
      for (const [metric, details] of Object.entries(metrics)) {
        const value = details.value;
        const weight = details.weight;
        const reverse = details.reverse;
        const score = reverse ? (100 - value) : value;
        totalScore += score * weight;
      }
      results[component] = parseFloat(totalScore.toFixed(2));
    }
    
    // Calculate composite score
    const componentScores = Object.values(results);
    const compositeScore = parseFloat((componentScores.reduce((sum, score) => sum + score, 0) / componentScores.length).toFixed(2));
    results["CompositeScore"] = compositeScore;
    
    return results;
  };

  // Generate the report
  const generateReport = () => {
    const results = calculateScores();
    
    // Transform data for charts
    const componentScores = [
      { name: 'Prompt Injection', score: results.PromptInjection, fill: '#ff9800' },
      { name: 'Output Manipulation', score: results.OutputManipulation, fill: '#4caf50' },
      { name: 'Data Exfiltration', score: results.DataExfiltration, fill: '#2196f3' },
      { name: 'Model Security', score: results.ModelSecurityMeasures, fill: '#9c27b0' }
    ];
    
    // Transform detailed metrics
    const detailedScores = [];
    
    for (const [component, metrics] of Object.entries(formData)) {
      const displayComponent = component === 'ModelSecurityMeasures' ? 'Model Security' : component;
      
      for (const [metric, details] of Object.entries(metrics)) {
        const displayValue = details.reverse ? 100 - details.value : details.value;
        
        detailedScores.push({
          category: displayComponent,
          name: metric.replace(/([A-Z])/g, ' $1').trim(), // Add spaces between camel case
          value: displayValue,
          rawValue: details.value,
          weight: details.weight,
          reversed: details.reverse
        });
      }
    }
    
    setAssessmentResults({
      compositeScore: results.CompositeScore,
      componentScores: componentScores,
      detailedScores: detailedScores
    });
    
    setShowReport(true);
  };

  // Reset the form
  const resetForm = () => {
    setFormData(initialFormData);
    setExpandedSections({});
    setShowReport(false);
  };

  // Helper functions for the report
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score) => {
    if (score >= 90) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (score >= 80) return <Shield className="w-6 h-6 text-blue-600" />;
    if (score >= 70) return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    return <AlertCircle className="w-6 h-6 text-red-600" />;
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill} className="text-2xl font-bold">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={10} textAnchor="middle" fill="#333" className="text-lg">
          {`${value.toFixed(2)}`}
        </text>
        <text x={cx} y={cy} dy={30} textAnchor="middle" fill="#999" className="text-sm">
          {`(${(percent * 100).toFixed(0)}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={innerRadius - 5}
          outerRadius={innerRadius - 2}
          fill={fill}
        />
      </g>
    );
  };

  // Form rendering
  const renderForm = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">LLM Security Assessment Input Form</h1>
        
        {Object.keys(formData).map(component => (
          <div key={component} className="mb-6 border rounded-lg overflow-hidden">
            <div 
              className="flex justify-between items-center p-4 bg-gray-100 cursor-pointer"
              onClick={() => toggleSection(component)}
            >
              <h2 className="text-lg font-bold">{component.replace(/([A-Z])/g, ' $1').trim()}</h2>
              {expandedSections[component] ? <ChevronUp /> : <ChevronDown />}
            </div>
            
            {expandedSections[component] && (
              <div className="p-4">
                {Object.keys(formData[component]).map(metric => (
                  <div key={metric} className="mb-6 last:mb-0 p-4 bg-gray-50 rounded">
                    <h3 className="font-bold mb-3">{metric.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Value (0-100)</label>
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          className="w-full p-2 border rounded"
                          value={formData[component][metric].value}
                          onChange={(e) => handleInputChange(component, metric, 'value', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (0-1)</label>
                        <input 
                          type="number" 
                          step="0.05"
                          min="0" 
                          max="1" 
                          className="w-full p-2 border rounded"
                          value={formData[component][metric].weight}
                          onChange={(e) => handleInputChange(component, metric, 'weight', e.target.value)}
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <label className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="mr-2"
                            checked={formData[component][metric].reverse}
                            onChange={(e) => handleInputChange(component, metric, 'reverse', e.target.checked)}
                          />
                          <span className="text-sm text-gray-700">Reverse Scoring</span>
                        </label>
                        <div className="ml-1 text-gray-500 text-xs">
                          (Lower is better)
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 mt-2">
                      {formData[component][metric].reverse ? 
                        `Effective score: ${100 - formData[component][metric].value}` : 
                        `Effective score: ${formData[component][metric].value}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        <div className="mt-6 flex justify-center space-x-4">
          <button 
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={generateReport}
          >
            <FileText className="mr-2 w-5 h-5" />
            Generate Report
          </button>
          
          <button 
            className="flex items-center px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={resetForm}
          >
            <RefreshCcw className="mr-2 w-5 h-5" />
            Reset Form
          </button>
        </div>
      </div>
    );
  };

  // Report rendering
  const renderReport = () => {
    if (!assessmentResults) return null;
    
    const { compositeScore, componentScores, detailedScores } = assessmentResults;
    
    const radarData = componentScores.map(item => ({
      subject: item.name,
      A: item.score,
      fullMark: 100,
    }));
    
    const filteredDetailedScores = detailedScores.filter(item => 
      item.category === componentScores[activeIndex].name
    );
    
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">LLM Security Assessment Dashboard</h1>
          <button 
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={() => setShowReport(false)}
          >
            Back to Form
          </button>
        </div>
        
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-5xl font-bold">{compositeScore}</div>
            <div className="text-lg text-gray-500">Composite Score</div>
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            {componentScores.map((component, index) => (
              <div 
                key={component.name} 
                className={`p-4 rounded-lg w-48 cursor-pointer border-2 ${activeIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => setActiveIndex(index)}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">{component.name}</div>
                  {getScoreIcon(component.score)}
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(component.score)}`}>
                  {component.score.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-center">Component Scores</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={componentScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" nameKey="name">
                  {componentScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-center">Security Balance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart outerRadius={90} data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Tooltip />
                <Radar name="Score" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-center">Score Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={componentScores}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="score"
                  onMouseEnter={onPieEnter}
                >
                  {componentScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2 text-center">{componentScores[activeIndex].name} Details</h2>
            <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
              {filteredDetailedScores.map((item, index) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm font-bold">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${item.value >= 90 ? 'bg-green-600' : item.value >= 80 ? 'bg-blue-600' : item.value >= 70 ? 'bg-yellow-500' : 'bg-red-600'}`} 
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.reversed ? 'Reverse Scored · ' : ''}Weight: {item.weight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Key Findings</h2>
          
          {/* Calculate strengths and weaknesses */}
          {(() => {
            // Find 4 highest scores
            const strengths = [...detailedScores]
              .sort((a, b) => b.value - a.value)
              .slice(0, 4);
              
            // Find 4 lowest scores
            const weaknesses = [...detailedScores]
              .sort((a, b) => a.value - b.value)
              .slice(0, 4);
              
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h3 className="font-bold text-green-800 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Strengths
                  </h3>
                  <ul className="mt-2 text-sm list-disc pl-5">
                    {strengths.map((item, index) => (
                      <li key={index}>
                        {item.name} ({item.value}/100)
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <h3 className="font-bold text-yellow-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Areas for Improvement
                  </h3>
                  <ul className="mt-2 text-sm list-disc pl-5">
                    {weaknesses.map((item, index) => (
                      <li key={index}>
                        {item.name} ({item.value}/100)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {!showReport ? renderForm() : renderReport()}
    </div>
  );
}

export default App;