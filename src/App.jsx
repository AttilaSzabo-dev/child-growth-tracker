import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import childDataRaw from './child_data.json';
import whoStandardsRaw from './who_standards.json';
import './App.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">Életkor: {label} hónap</p>
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

const DateTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const entryData = payload[0]?.payload;
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">Dátum: {label} {entryData?.ageMonths !== undefined ? `(${entryData.ageMonths} hó)` : ''}</p>
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

  const chartDataByAge = useMemo(() => {
    const map = new Map();
    whoStandardsRaw.forEach(item => {
      map.set(item.ageMonths, { ...item, weight: null, length: null, headCircumference: null });
    });

    childDataRaw.forEach(entry => {
      if (map.has(entry.ageMonths)) {
        const existing = map.get(entry.ageMonths);
        map.set(entry.ageMonths, {
          ...existing,
          weight: entry.weight !== null ? entry.weight : existing.weight,
          length: entry.length !== null ? entry.length : existing.length,
          headCircumference: entry.headCircumference !== null ? entry.headCircumference : existing.headCircumference,
        });
      } else {
        map.set(entry.ageMonths, {
          ageMonths: entry.ageMonths,
          whoWeight: null,
          whoLength: null,
          whoHead: null,
          weight: entry.weight,
          length: entry.length,
          headCircumference: entry.headCircumference,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.ageMonths - b.ageMonths);
  }, []);

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
                  <Tooltip content={<DateTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="weight" name="Mért súly (kg)" stroke="#3b82f6" strokeWidth={3} connectNulls dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 1/B. Grafikon: Súly (Kor alapú + WHO Fix Átlag Vonal) */}
          <div className="chart-card">
            <div className="chart-header">⚖️ Testsúly vs. WHO Átlag (Életkor szerint)</div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={chartDataByAge} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="ageMonths" type="number" domain={[0, 24]} ticks={[0,3,6,9,12,15,18,21,24]} stroke="#888" tick={{ fill: '#888', fontSize: 12 }} unit=" hó" />
                  <YAxis stroke="#888" domain={[2, 14]} tick={{ fill: '#888' }} />
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
                  <Tooltip content={<DateTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="length" name="Mért hossz (cm)" stroke="#10b981" strokeWidth={3} connectNulls dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2/B. Grafikon: Hossz (Kor alapú + WHO Fix Átlag Vonal) */}
          <div className="chart-card">
            <div className="chart-header">📏 Hossz vs. WHO Átlag (Életkor szerint)</div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={chartDataByAge} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="ageMonths" type="number" domain={[0, 24]} ticks={[0,3,6,9,12,15,18,21,24]} stroke="#888" tick={{ fill: '#888', fontSize: 12 }} unit=" hó" />
                  <YAxis stroke="#888" domain={[45, 95]} tick={{ fill: '#888' }} />
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
                  <Tooltip content={<DateTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="headCircumference" name="Mért fejkörméret (cm)" stroke="#f59e0b" strokeWidth={3} connectNulls dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3/B. Grafikon: Fejkörméret (Kor alapú + WHO Fix Átlag Vonal) */}
          <div className="chart-card">
            <div className="chart-header">🧠 Fejkörméret vs. WHO Átlag (Életkor szerint)</div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={chartDataByAge} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="ageMonths" type="number" domain={[0, 24]} ticks={[0,3,6,9,12,15,18,21,24]} stroke="#888" tick={{ fill: '#888', fontSize: 12 }} unit=" hó" />
                  <YAxis stroke="#888" domain={[30, 52]} tick={{ fill: '#888' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="headCircumference" name="Mért fejkörméret" stroke="#f59e0b" strokeWidth={3} connectNulls dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="whoHead" name="WHO Átlag Fejkörméret" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" connectNulls dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. ÚJ: Összesített (Mester) Grafikon Dátum szerint */}
          <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
            <div className="chart-header">🌐 Összesített Fejlődési Mester Grafikon (Dátum szerint)</div>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <LineChart data={chartDataByDate} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                  
                  {/* Bal Y-tengely a Súlyhoz (kg) */}
                  <YAxis yAxisId="left" stroke="#3b82f6" domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#888' }} />
                  {/* Jobb Y-tengely a Hossznak és Fejkörméretnek (cm) */}
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" domain={['dataMin - 5', 'dataMax + 5']} tick={{ fill: '#888' }} />
                  
                  <Tooltip content={<DateTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '15px' }} />
                  
                  <Line yAxisId="left" type="monotone" dataKey="weight" name="Súly (kg)" stroke="#3b82f6" strokeWidth={3} connectNulls dot={{ r: 5 }} />
                  <Line yAxisId="right" type="monotone" dataKey="length" name="Hossz (cm)" stroke="#10b981" strokeWidth={3} connectNulls dot={{ r: 5 }} />
                  <Line yAxisId="right" type="monotone" dataKey="headCircumference" name="Fejkörméret (cm)" stroke="#f59e0b" strokeWidth={3} connectNulls dot={{ r: 5 }} />
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