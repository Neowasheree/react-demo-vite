import { useState, useEffect } from 'react';
import allowedStops from '../allowedStops';

const BASE_URL = 'https://www.mvg.de/api/bgw-pt/v3';

export default function Home() {
  const [input, setInput] = useState('');
  const [lines, setLines] = useState([]); // ✅ 查询结果改为对象数组
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
    const termRaw = customTerm ?? input;
    const term = typeof termRaw === 'string' ? termRaw.trim() : '';
    if (!term) {
      alert('请输入站点名称');
      return;
    }

    setLogs('查询中…');
    setLines([]);

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

    const formattedLines = data.map((d) => {
      const departMs = d.realtimeDepartureTime;
      const mins = Math.round((departMs - now) / 60000);
      const timeStr = new Date(departMs).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const status = d.cancelled
        ? '❌ Cancelled'
        : d.delayInMinutes > 0
        ? `⏱️ Delayed +${d.delayInMinutes}min`
        : '✅ On time';

      return {
        line: `${d.transportType}${d.label}`,
        destination: d.destination,
        time: timeStr,
        mins,
        status,
      };
    });

    setLines(formattedLines);
    setLogs('');

    saveStop(stopName);

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${stopName} Departures`, {
        body: formattedLines
          .map((l) => `${l.line} → ${l.destination}: ${l.time} (${l.status})`)
          .join('\n'),
      });
    }

    setInput('');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700 tracking-wide mb-1">🚋 Tram Departures</h1>
        <p className="text-gray-600 text-sm sm:text-base mb-4">
          查看慕尼黑轻轨 & 公交的实时到站信息
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入站点名（如 Borstei）"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
        />
        <button
          onClick={() => queryDepartures()}
          className="w-full sm:w-auto flex items-center gap-2 justify-center px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
        >
          🔍 查询并通知
        </button>
      </div>

      {recentStops.length > 0 && (
        <div className="mb-6">
          <h2 className="text-md font-semibold text-gray-700 mb-2 flex items-center gap-2">
            🕘 最近使用
          </h2>
          <div className="flex flex-wrap gap-2">
            {recentStops.map((name) => (
              <button
                key={name}
                onClick={() => {
                  setInput(name);
                  queryDepartures(name);
                }}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-sm rounded-full shadow-sm transition"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {logs && <p className="text-gray-500">{logs}</p>}
        {lines.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border rounded-lg shadow-sm p-3 text-sm space-y-1"
          >
            <div className="flex justify-between items-center font-semibold text-blue-700">
              <div>{item.line} → {item.destination}</div>
              <div>{item.time}（{item.mins}min）</div>
            </div>
           <div className={
              item.status.includes('Delayed')
                ? 'text-red-600'
                : item.status.includes('On time')
                ? 'text-green-600'
                : item.status.includes('Cancelled')
                ? 'text-gray-500'
                : 'text-gray-700'
            }>
              {item.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
