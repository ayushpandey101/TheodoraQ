import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Award, 
  Clock, 
  TrendingUp, 
  LogOut, 
  Bell, 
  User,
  FileText,
  Calendar,
  Target,
  CheckCircle2,
  PlayCircle
} from 'lucide-react';

/**
 * Candidate Dashboard Component
 * For testing authentication and OAuth integration
 */
function CandidateDashboard({ onLogout, userData }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap";
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.innerHTML = `
      .font-serif { font-family: 'Playfair Display', serif; }
      .font-sans { font-family: 'Inter', sans-serif; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  // Mock data
  const stats = [
    { icon: FileText, label: 'Tests Completed', value: '12', color: 'blue' },
    { icon: Clock, label: 'Tests in Progress', value: '2', color: 'orange' },
    { icon: Award, label: 'Average Score', value: '85%', color: 'green' },
    { icon: Target, label: 'Tests Available', value: '5', color: 'purple' },
  ];

  const availableTests = [
    { 
      title: 'React.js Advanced Assessment', 
      duration: '60 min', 
      difficulty: 'Advanced', 
      questions: 25,
      status: 'available'
    },
    { 
      title: 'JavaScript Fundamentals', 
      duration: '45 min', 
      difficulty: 'Intermediate', 
      questions: 20,
      status: 'available'
    },
    { 
      title: 'Python Data Structures', 
      duration: '90 min', 
      difficulty: 'Advanced', 
      questions: 30,
      status: 'in-progress'
    },
  ];

  const completedTests = [
    { title: 'HTML & CSS Basics', score: 92, date: '2 days ago', status: 'passed' },
    { title: 'Node.js Express', score: 78, date: '5 days ago', status: 'passed' },
    { title: 'SQL Fundamentals', score: 88, date: '1 week ago', status: 'passed' },
  ];

  const TheodoraQLogo = () => (
    <div className="flex items-center gap-2">
      <img 
        src="/src/assets/dark_mode_theodoraQ_logo.svg" 
        alt="TheodoraQ Logo" 
        className="h-8 w-auto"
      />
      <span className="font-sans font-extrabold text-xl text-gray-800">TheodoraQ</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <TheodoraQLogo />
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800">{userData?.name || 'Candidate User'}</p>
                  <p className="text-xs text-gray-500">Candidate</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {(userData?.name || 'C')[0].toUpperCase()}
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* SIDEBAR */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] hidden lg:block">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('tests')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'tests'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Available Tests</span>
            </button>

            <button
              onClick={() => setActiveTab('results')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'results'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Award className="w-5 h-5" />
              <span className="font-medium">My Results</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'profile'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome back, {userData?.name?.split(' ')[0] || 'Candidate'}! 👋
              </h1>
              <p className="text-gray-600">Track your progress and continue your assessments.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className={`p-3 rounded-lg bg-${stat.color}-50 inline-block mb-4`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Available Tests */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-800">Available Tests</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {availableTests.map((test, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-2">{test.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {test.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {test.questions} questions
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              test.difficulty === 'Advanced' 
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {test.difficulty}
                            </span>
                          </div>
                        </div>
                        <button className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                          test.status === 'in-progress'
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}>
                          {test.status === 'in-progress' ? (
                            <>
                              <PlayCircle className="w-4 h-4" />
                              Continue
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-4 h-4" />
                              Start Test
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Results & Profile Info */}
              <div className="space-y-6">
                {/* Recent Results */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Results</h2>
                  <div className="space-y-3">
                    {completedTests.map((test, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm text-gray-800">{test.title}</p>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{test.date}</span>
                          <span className={`font-semibold ${
                            test.score >= 80 ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {test.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Profile Card */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Profile Information</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-800">{userData?.name || 'John Doe'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-800">{userData?.email || 'candidate@example.com'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <span className="font-medium text-gray-800">Candidate</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since:</span>
                      <span className="font-medium text-gray-800">Jan 2025</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CandidateDashboard;
