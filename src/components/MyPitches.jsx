import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { motion, AnimatePresence } from "framer-motion"
import PitchCard from "./PitchCard"
import PitchModal from "./PitchModal"

export default function MyPitches({ user, onNavigate }) {
  const [pitches, setPitches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPitch, setSelectedPitch] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterIndustry, setFilterIndustry] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // 🔹 Fetch user pitches from Supabase
  useEffect(() => {
    async function fetchPitches() {
      setLoading(true)
      const { data, error } = await supabase
        .from("pitches")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error fetching pitches:", error)
        showNotification("❌ Failed to load pitches", "error")
      } else {
        setPitches(data)
      }
      setLoading(false)
    }

    fetchPitches()
  }, [user.id])

  // 🔹 Delete pitch
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this pitch?")) return
    const { error } = await supabase.from("pitches").delete().eq("id", id)
    if (error) {
      console.error("❌ Delete Error:", error)
      showNotification("❌ Failed to delete pitch", "error")
    } else {
      setPitches(pitches.filter((p) => p.id !== id))
      showNotification("✅ Pitch deleted successfully!", "success")
      setSelectedPitch(null)
    }
  }

  // 🔹 Filter and sort pitches
  const filteredPitches = pitches
    .filter(pitch => {
      const matchesSearch = pitch.generated_data?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pitch.generated_data?.tagline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pitch.industry?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesIndustry = filterIndustry === "all" || pitch.industry === filterIndustry

      return matchesSearch && matchesIndustry
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at)
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at)
        case "name":
          return a.generated_data?.name?.localeCompare(b.generated_data?.name)
        default:
          return 0
      }
    })

  // 🔹 Get unique industries for filter
  const industries = ["all", ...new Set(pitches.map(p => p.industry).filter(Boolean))]

  // 🔹 Notification function
  const showNotification = (message, type) => {
    const el = document.createElement("div")
    el.className = `fixed top-4 right-4 px-6 py-4 rounded-xl shadow-2xl z-50 font-semibold backdrop-blur-sm border animate-fade-in-right ${type === "success"
      ? "bg-green-500/90 text-white border-green-400"
      : "bg-red-500/90 text-white border-red-400"
      }`
    el.innerHTML = `
      <div class="flex items-center">
        <span class="mr-3 text-lg">${type === "success" ? "✅" : "❌"}</span>
        <span>${message}</span>
      </div>
    `
    document.body.appendChild(el)
    setTimeout(() => {
      el.style.opacity = "0"
      el.style.transform = "translateX(100%)"
      setTimeout(() => el.remove(), 300)
    }, 4000)
  }

  // 🔹 Preview landing page
  const previewLandingPage = (pitch) => {
    if (!pitch.landing_code) {
      showNotification("No landing page code available", "error")
      return
    }

    const blob = new Blob([pitch.landing_code], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'transparent' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center py-12 sm:py-16">
            <div className="loading-spinner mx-auto mb-4 sm:mb-6"></div>
            {/* DARK THEME: Changed text from neutral-700 to white for better contrast on black background */}
            <h2 className="text-xl sm:text-2xl font-primary font-bold text-white mb-2">Loading Your Pitches</h2>
            {/* DARK THEME: Changed text from neutral-600 to white for better contrast */}
            <p className="text-sm sm:text-base text-white font-medium">Gathering your startup portfolio...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'transparent' }}>
      <div className="w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 sm:mb-12 animate-fade-in-up"
        >
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6 mb-6 lg:mb-0">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-xl mx-auto sm:mx-0"
            >
              <span className="text-white text-2xl sm:text-3xl">📋</span>
            </motion.div>
            <div className="text-center sm:text-left">
              {/* GRADIENT TEXT: Preserved gradient-text class as it contains gradient styling */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-primary font-bold gradient-text mb-1 sm:mb-2">
                My Pitches
              </h1>
              {/* DARK THEME: Changed text from neutral-600 to white for better contrast */}
              <p className="text-base sm:text-lg lg:text-xl text-white font-medium">Manage and review your generated startup pitches</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Create New Pitch Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate && onNavigate('generate')}
              className="btn-primary px-6 py-3 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
            >
              <span className="text-lg">✨</span>
              <span>Create New Pitch</span>
            </motion.button>

            {/* Pitch Count */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="card-glass px-4 sm:px-6 lg:px-8 py-3 sm:py-4"
            >
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                {/* DARK THEME: Changed text from neutral-600 to white for better contrast */}
                <span className="text-sm sm:text-base text-white font-medium">Total Pitches:</span>
                <span className="font-primary font-bold text-primary-600 text-xl sm:text-2xl">{pitches.length}</span>
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-500 rounded-full animate-pulse"></span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-glass p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 animate-fade-in-up"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-1">
              {/* DARK THEME: Changed label text from neutral-700 to white for better contrast */}
              <label className="flex items-center text-xs sm:text-sm font-primary font-bold text-white mb-2 sm:mb-3">
                <span className="mr-1.5 sm:mr-2 text-base sm:text-lg">🔍</span>
                Search Pitches
              </label>
              <input
                type="text"
                placeholder="Search by name, tagline, or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field text-sm sm:text-base"
              />
            </div>

            {/* Industry Filter */}
            <div>
              {/* DARK THEME: Changed label text from neutral-700 to white for better contrast */}
              <label className="flex items-center text-xs sm:text-sm font-primary font-bold text-white mb-2 sm:mb-3">
                <span className="mr-1.5 sm:mr-2 text-base sm:text-lg">🏢</span>
                <span className="hidden sm:inline">Filter by Industry</span>
                <span className="sm:hidden">Industry</span>
              </label>
              <div className="relative group">
                <select
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                  className="input-field appearance-none cursor-pointer pr-10 text-sm sm:text-base relative bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                >
                  {industries.map(industry => (
                    <option key={industry} value={industry} className="bg-neutral-900 text-white py-2">
                      {industry === "all" ? "All Industries" : industry}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-neutral-400 group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div>
              {/* DARK THEME: Changed label text from neutral-700 to white for better contrast */}
              <label className="flex items-center text-xs sm:text-sm font-primary font-bold text-white mb-2 sm:mb-3">
                <span className="mr-1.5 sm:mr-2 text-base sm:text-lg">📊</span>
                Sort By
              </label>
              <div className="relative group">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field appearance-none cursor-pointer pr-10 text-sm sm:text-base relative bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                >
                  <option value="newest" className="bg-neutral-900 text-white py-2">Newest First</option>
                  <option value="oldest" className="bg-neutral-900 text-white py-2">Oldest First</option>
                  <option value="name" className="bg-neutral-900 text-white py-2">Name A-Z</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-neutral-400 group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          {(searchTerm || filterIndustry !== "all") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-neutral-200"
            >
              {/* DARK THEME: Changed text from neutral-600 to white for better contrast */}
              <div className="flex items-center justify-center space-x-2 text-white">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent-500 rounded-full animate-pulse"></span>
                <p className="font-medium text-sm sm:text-base text-center">
                  Showing {filteredPitches.length} of {pitches.length} pitches
                  {searchTerm && ` for "${searchTerm}"`}
                  {filterIndustry !== "all" && ` in ${filterIndustry}`}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Pitches Grid */}
        {filteredPitches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-card)',
              backdropFilter: 'var(--glass-backdrop)',
            }}
            className="p-8 sm:p-12 lg:p-16 text-center animate-fade-in-up rounded-2xl"
          >
            <div
              style={{ background: 'var(--gradient-primary-subtle)' }}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8"
            >
              <span className="text-4xl sm:text-6xl">💡</span>
            </div>
            <h3
              style={{ color: 'var(--text-primary)' }}
              className="text-2xl sm:text-3xl font-primary font-bold mb-3 sm:mb-4"
            >
              No Pitches Found
            </h3>
            <p
              style={{ color: 'var(--text-secondary)' }}
              className="text-base sm:text-lg max-w-md mx-auto mb-6 sm:mb-8 font-medium leading-relaxed"
            >
              {pitches.length === 0
                ? "You haven't generated any startup pitches yet. Create your first pitch to see it here!"
                : "No pitches match your search criteria. Try adjusting your filters."
              }
            </p>
            {pitches.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.hash = "#generate"}
                className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
              >
                <span className="mr-2 sm:mr-3 text-lg sm:text-xl">✨</span>
                Create Your First Pitch
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 animate-stagger"
          >
            {filteredPitches.map((pitch, index) => (
              <PitchCard
                key={pitch.id}
                pitch={pitch}
                index={index}
                onView={() => setSelectedPitch(pitch)}
                onDelete={() => handleDelete(pitch.id)}
                onPreview={() => previewLandingPage(pitch)}
              />
            ))}
          </motion.div>
        )}

        {/* Pitch Detail Modal */}
        <AnimatePresence>
          {selectedPitch && (
            <PitchModal
              pitch={selectedPitch}
              onClose={() => setSelectedPitch(null)}
              onDelete={() => handleDelete(selectedPitch.id)}
              onPreview={() => previewLandingPage(selectedPitch)}
              onSimulate={() => {
                if (onNavigate) {
                  onNavigate("investor-chat", selectedPitch);
                }
              }}
              onPractice={() => {
                if (onNavigate) {
                  onNavigate("pitch-practice", selectedPitch);
                }
              }}
            />
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}