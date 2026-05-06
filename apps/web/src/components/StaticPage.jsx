import React, { useEffect, useState } from 'react';

export default function StaticPage({ fileName }) {
  const [html, setHtml] = useState('Loading...');

  useEffect(() => {
    let mounted = true;

    fetch(`/ui/${fileName}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.text();
      })
      .then((text) => {
        if (mounted) setHtml(text);
      })
      .catch(() => {
        if (mounted) setHtml('<div style="padding:20px">Không thể tải giao diện tĩnh.</div>');
      });

    return () => {
      mounted = false;
    };
  }, [fileName]);

  return (
    <div className="static-page" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
