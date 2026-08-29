import { useEffect, useRef, useState } from 'react';

export function useWebSocket(url: string) {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState('CONNECTING');
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => setStatus('CONNECTED');
    ws.current.onmessage = (event) => setData(JSON.parse(event.data));
    ws.current.onclose = () => setStatus('DISCONNECTED');
    ws.current.onerror = () => setStatus('ERROR');

    return () => {
      ws.current?.close();
    };
  }, [url]);

  return { data, status, ws: ws.current };
}
