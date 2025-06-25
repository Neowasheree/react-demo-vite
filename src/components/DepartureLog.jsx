// DepartureLog component: grouped by tram line (样式B)
import { motion, AnimatePresence } from 'framer-motion';

export default function DepartureLog({ lines }) {
  if (!Array.isArray(lines) || lines.length === 0) return null;

  // 分组：按 line 名称（如 '20 Tram'）
  const grouped = lines.reduce((acc, item) => {
    const key = item.line;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const getColorClass = (line) => {
    if (line.includes('20')) return 'bg-cyan-500';
    if (line.includes('21')) return 'bg-amber-600';
    if (line.includes('N20')) return 'bg-teal-600';
    return 'bg-gray-400';
  };

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([line, items], idx) => (
        <motion.div
          key={line}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow rounded-lg overflow-hidden"
        >
          <div className="flex items-center px-4 py-2 border-b">
            <div className={`text-white text-sm font-bold px-2 py-1 rounded ${getColorClass(line)}`}>
              {line}
            </div>
            <div className="ml-3 font-semibold text-gray-800">
              {line} Tram
            </div>
          </div>

          <div className="divide-y text-sm">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between px-4 py-2">
                <div>
                  <div>{item.destination}</div>
                  <div className="text-gray-500 text-xs">
                    {item.status === '❌ Cancelled'
                      ? '已取消'
                      : item.status.includes('Delayed')
                      ? item.status
                      : 'On time'}
                  </div>
                </div>
                <div className="text-right whitespace-nowrap">
                  <div className="font-medium">{item.mins} min</div>
                  <div className="text-xs text-gray-400">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
