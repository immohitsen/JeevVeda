import { Search, Plus, Mail, Bell, Settings, MoreHorizontal, TrendingUp, TrendingDown, Calendar, Users, Bed, FileText, X, Maximize2 } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Main Dashboard Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Dashboard</h1>
        <p className="text-base leading-relaxed text-gray-600">Overview of patient health, appointments, and revenue metrics</p>
      </div>

      {/* Top Row of Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Patients Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative">
          <div className="absolute top-4 right-4">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-base leading-relaxed text-gray-600">Total Patients</p>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500 text-sm font-medium">+2.1%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">150 more than Yesterday</p>
            </div>
          </div>
        </div>

        {/* Appointments Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative">
          <div className="absolute top-4 right-4">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-base leading-relaxed text-gray-600">Appointments</p>
              <div className="flex items-center gap-2 mt-1">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-red-500 text-sm font-medium">-1.5%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">15 more than Yesterday</p>
            </div>
          </div>
        </div>

        {/* Bed Room Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative">
          <div className="absolute top-4 right-4">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Bed className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-base leading-relaxed text-gray-600">Bed Room</p>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500 text-sm font-medium">+2.1%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">260 more than Yesterday</p>
            </div>
          </div>
        </div>

        {/* Total Invoice Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative">
          <div className="absolute top-4 right-4">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-base leading-relaxed text-gray-600">Total Invoice</p>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500 text-sm font-medium">+2.1%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">1050 more than Yesterday</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Health Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Patient Health</h2>
            <p className="text-base leading-relaxed text-gray-600">From Patient</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">K</span>
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="relative">
          {/* Lung Visualization Background */}
          <div className="w-full h-80 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl relative overflow-hidden">
            {/* Simplified lung-like shape */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full relative">
                {/* Lung lobes */}
                <div className="absolute top-8 left-8 w-20 h-24 bg-purple-300/40 rounded-full"></div>
                <div className="absolute top-8 right-8 w-20 h-24 bg-blue-300/40 rounded-full"></div>
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-purple-200/40 rounded-full"></div>
              </div>
            </div>
            
            {/* Heart rate indicator */}
            <div className="absolute top-8 right-8 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg">
              <span className="text-sm font-medium text-gray-700">108 bpm</span>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Overlaid Cards */}
          <div className="absolute top-8 left-8">
            {/* Appointment Card */}
            <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-100 w-64">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-purple-600">ID</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Dr. Ishita Datta</p>
                  <p className="text-sm text-gray-600">Pulmonary</p>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-sm font-medium text-purple-900">Today</p>
                <p className="text-xs text-purple-700">01:15 PM - 02:00 PM</p>
              </div>
            </div>
          </div>

          <div className="absolute top-8 right-8">
            {/* Vitals Card */}
            <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-100 w-64">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">JH</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Jeffrey Hessel</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Maximize2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Temperature</span>
                  <span className="font-medium">45.06° C</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Heart rate</span>
                  <span className="font-medium">108 bpm</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Blood</span>
                  <span className="font-medium">96%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Revenue Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Total Revenue</h2>
            <p className="text-base leading-relaxed text-gray-600">01.07.2025</p>
          </div>
          <div className="flex items-center gap-4">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Monthly</option>
            </select>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button className="px-4 py-2 text-sm font-medium bg-gray-300 text-gray-700 rounded-md">Expense</button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Income</button>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-64 bg-gray-50 rounded-lg p-4 mb-6">
          {/* Simplified line chart */}
          <div className="h-full flex items-end justify-between">
            {['Jan', 'Apr', 'May', 'Jun', 'Jul', 'Sep', 'Dec'].map((month, index) => (
              <div key={month} className="flex flex-col items-center">
                <div className="w-16 h-32 bg-gradient-to-t from-purple-200 to-transparent rounded-t-lg mb-2"></div>
                <div className="w-16 h-24 bg-gradient-to-t from-green-200 to-transparent rounded-t-lg mb-2"></div>
                <span className="text-xs text-gray-600">{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Figures */}
        <div className="flex gap-8">
          <div>
            <p className="text-base leading-relaxed text-gray-600">Hospital total Income</p>
            <p className="text-lg font-semibold text-gray-900">$ 7,12,3264</p>
          </div>
          <div>
            <p className="text-base leading-relaxed text-gray-600">Hospital total Expense</p>
            <p className="text-lg font-semibold text-gray-900">$ 14,965,5476</p>
          </div>
        </div>
      </div>
    </div>
  )
}
