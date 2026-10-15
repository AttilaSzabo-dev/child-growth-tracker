import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import childDataRaw from './child_data.json';
import './App.css';

// Okos Tooltip, ami kezeli a dátumot, a kort és az értékeket is
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // A payload első elemletéből kiolvassuk az ageMonths-t (ha van a ponton)
    const age = payload[0]?.payload?.ageMonths;

    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">
          {label} {age !== undefined && age !== null ? `(${age} hó)` : ''}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="tooltip-row">
            <span style={{ color: entry.color, fontWeight: 'bold' }}>{entry.name}:</span>
            <span style={{ color: '#fff' }}>{entry.value !== null && entry.value !== undefined ? entry.value : 'Nincs adat'}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function App() {
  const sortedEntries = [...childDataRaw].sort((a, b) => new Date(b.date) - new Date(a.date));
  const chartDataByDate = [...childDataRaw].sort((a, b) => new Date(a.date) - new Date(b.date));
  const chartDataByAge = [...childDataRaw].sort((a, b) => a.ageMonths - b.ageMonths);

  return (
    <div className="app-wrapper">
      
      {/* BAL OSZLOP: Bejegyzések Listája */}
      <div className="sidebar">
        <div className="sidebar-header">👶 Fejlődési Napló</div>

        <div className="history-list">
          {sortedEntries.map(entry => (
            <div key={entry.id} className="entry-card">
              <div className="entry-date">
                {entry.date}
                <span className="entry-age">({entry.ageMonths} hó)</span>
              </div>
              
              <div className="entry-stat">
                Súly: <strong style={{color: '#3b82f6'}}>{entry.weight ? `${entry.weight} kg` : '-'}</strong>
              </div>
              <div className="entry-stat">
                Hossz / Magasság: <strong style={{color: '#10b981'}}>{entry.length ? `${entry.length} cm` : '-'}</strong>
              </div>
              <div className="entry-stat">
                Fejkörméret: <strong style={{color: '#f59e0b'}}>{entry.headCircumference ? `${entry.headCircumference} cm` : '-'}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* JOBB OSZLOP: Grafikonok Grid */}
      <div className="main-content">
        <div className="charts-grid">
          
          {/* 1/A. Grafikon: Súly (Dátum alapú) */}
          <div className="chart-card">
            <div className="chart-header">⚖️ Testsúly fejlődés (Dátum szerint)</div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={chartDataByDate} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                  <YAxis stroke="#888" domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#888' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="weight" name="Mért súly (kg)" stroke="#3b82f6" strokeWidth={3} connectNulls dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 1/B. Grafikon: Súly (Kor alapú + WHO Átlag) */}
          <div className="chart-card">
            <div className="chart-header">⚖️ Testsúly vs. WHO Átlag (Életkor szerint)</div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={chartDataByAge} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  {/* Itt a domain határozza meg, hogy meddig tartson az X tengely (pl. legmagasabb hónap + 2 hónap ráhagyással) */}
                  <XAxis dataKey="ageMonths" type="number" domain={[0, 'dataMax + 2']} stroke="#888" tick={{ fill: '#888', fontSize: 12 }} unit=" hó" />
                  <YAxis stroke="#888" domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#888' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="weight" name="Mért súly" stroke="#3b82f6" strokeWidth={3} connectNulls dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="whoWeight" name="WHO Átlag Súly" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" connectNulls dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2/A. Grafikon: Hossz (Dátum alapú) */}
          <div className="chart-card">
            <div className="chart-header">📏 Hossz / Magasság (Dátum szerint)</div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={chartDataByDate} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                  <YAxis stroke="#888" domain={['dataMin - 5', 'dataMax + 5']} tick={{ fill: '#888' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="length" name="Mért hossz (cm)" stroke="#10b981" strokeWidth={3} connectNulls dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2/B. Grafikon: Hossz (Kor alapú + WHO Átlag) */}
          <div className="chart-card">
            <div className="chart-header">📏 Hossz vs. WHO Átlag (Életkor szerint)</div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={chartDataByAge} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="ageMonths" type="number" domain={[0, 'dataMax + 2']} stroke="#888" tick={{ fill: '#888', fontSize: 12 }} unit=" hó" />
                  <YAxis stroke="#888" domain={['dataMin - 5', 'dataMax + 5']} tick={{ fill: '#888' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="length" name="Mért hossz" stroke="#10b981" strokeWidth={3} connectNulls dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="whoLength" name="WHO Átlag Hossz" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" connectNulls dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3/A. Grafikon: Fejkörméret (Dátum alapú) */}
          <div className="chart-card">
            <div className="chart-header">🧠 Fej körfogat (Dátum szerint)</div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={chartDataByDate} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                  <YAxis stroke="#888" domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#888' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="headCircumference" name="Mért fejkörméret (cm)" stroke="#f59e0b" strokeWidth={3} connectNulls dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3/B. Grafikon: Fejkörméret (Kor alapú + WHO Átlag) */}
          <div className="chart-card">
            <div className="chart-header">🧠 Fejkörméret vs. WHO Átlag (Életkor szerint)</div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={chartDataByAge} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="ageMonths" type="number" domain={[0, 'dataMax + 2']} stroke="#888" tick={{ fill: '#888', fontSize: 12 }} unit=" hó" />
                  <YAxis stroke="#888" domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#888' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="headCircumference" name="Mért fejkörméret" stroke="#f59e0b" strokeWidth={3} connectNulls dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="whoHead" name="WHO Átlag Fejkörméret" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" connectNulls dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;