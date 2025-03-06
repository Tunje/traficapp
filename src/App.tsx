import { useState } from 'react'
import './App.css'
import logoImage from '../logo/TLT-Logo.png'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<string[]>([])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // This is where you would normally fetch data based on the search query
    // For now, we'll just set the query as the only result
    if (searchQuery.trim()) {
      setResults([searchQuery]) // Replace previous results instead of stacking them
      setSearchQuery('')
    }
  }

  return (
    <div className="container">
      <div className="logo-container">
        <img src={logoImage} alt="Logo" className="logo" />
      </div>
      <div className="search-container">
        <form onSubmit={handleSearch}>
          <div className="search-bar-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </div>
        </form>
      </div>
      
      <div className="results-container">
        <h2>Search Results</h2>
        {results.length > 0 ? (
          <ul className="results-list">
            {results.map((result, index) => (
              <li key={index} className="result-item">
                {result}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-results">No results to display</p>
        )}
      </div>
    </div>
  )
}

export default App
