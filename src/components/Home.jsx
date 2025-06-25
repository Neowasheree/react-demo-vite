import { useState, useEffect } from 'react';
import Header from './Header';
import StopInput from './StopInput';
import DepartureLog from './DepartureLog';
import allowedStops from '../allowedStops';

const BASE_URL = 'https://www.mvg.de/api/bgw-pt/v3';

export default function Home() {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState('请搜索站点');
  const [recentStops, setRecentStops] = useState([]);

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
    const saved = JSON.parse(localStorage.getItem('recentStops') || '[]');
    setRecentStops(saved);
  }, []);

  const saveStop = (name) => {
    const updated = [name, ...recentStops.filter((s) => s !== name)].slice(0, 5);
    setRecentStops(updated);
    localStorage.setItem('recentStops', JSON.stringify(updated));
  };

  const queryDepartures = async (customTerm) => {
    setLogs('查询中…');

    const termRaw = customTerm ?? input;
    const term = typeof termRaw === 'string' ? termRaw.trim() : '';
    if (!term) {
      alert('请输入站点名称');
      return;
    }

    const candidates = Object.keys(allowedStops).filter((name) =>
      name.toLowerCase().includes(term.toLowerCase())
    );

    if (candidates.length === 0) {
      setLogs(`未在列表中找到“${term}”`);
      return;
    }

    let stopName = candidates[0];
    if (candidates.length > 1) {
      const choice = prompt(
        '匹配到多个站点，请从下面复制完整名称粘贴：\n' + candidates.join('\n')
      );
      if (!choice || !allowedStops[choice]) {
        setLogs('未选择有效站点');
        return;
      }
      stopName = choice;
    }

    const stopId = allowedStops[stopName];
    const url = `${BASE_URL}/departures?globalId=${encodeURIComponent(
      stopId
    )}&limit=5&transportTypes=TRAM,BUS`;

    let data;
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      data = await res.json();
    } catch (e) {
      console.error(e);
      setLogs('网络请求失败');
      return;
    }

    const now = Date.now();
    if (!Array.isArray(data) || data.length === 0) {
      setLogs(`${stopName} 暂无未来班次`);
      return;
    }

    const lines = data.map((d) => {
      const departMs = d.realtimeDepartureTime;
      const mins = Math.round((departMs - now) / 60000);
      const timeStr = new Date(departMs).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const status = d.cancelled
        ? '❌ Cancelled'
        : d.delayInMinutes > 0
        ? `Delayed +${d.delayInMinutes}min`
        : 'On time';

      return `${d.transportType}${d.label} → ${d.destination}: ${timeStr} (in ${mins}min) ${status}`;
    });

    setLogs(lines.join('\n'));
    saveStop(stopName);

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${stopName} Departures`, {
        body: lines.join('\n'),
      });
    }

    setInput('');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 bg-white rounded-lg shadow-xl">
      <h1 className="text-4xl font-bold text-center text-blue-700 mb-6 tracking-wide">
        🚋 Tram Departures
      </h1>

      <div className="mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请输入站点名（如 Borstei）"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
        />
        <button
          onClick={() => queryDepartures()}
          className="w-full mt-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
        >
          🔍 查询并通知
        </button>
      </div>

      {recentStops.length > 0 && (
        <div className="mb-6">
          <h2 className="text-md font-semibold text-gray-700 mb-2">🕘 最近使用</h2>
          <div className="flex flex-wrap gap-2">
            {recentStops.map((name) => (
              <button
                key={name}
                onClick={() => {
                  setInput(name);
                  queryDepartures(name);
                }}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-sm rounded-full shadow-sm transition"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {logs.split('\n').map((line, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-gray-100 border-l-4 border-blue-500 text-sm shadow-sm font-mono"
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
