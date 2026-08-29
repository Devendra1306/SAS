import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props { 
  data: any[]; 
  xKey: string; 
  bars: {key: string; color: string; label: string}[]; 
  height?: number 
}

export const AttendanceBarChart: React.FC<Props> = ({ data, xKey, bars, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey={xKey} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          cursor={{ fill: '#f3f4f6' }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        {bars.map((bar) => (
          <Bar 
            key={bar.key} 
            dataKey={bar.key} 
            name={bar.label} 
            fill={bar.color} 
            radius={[4, 4, 0, 0]} 
            maxBarSize={50}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
