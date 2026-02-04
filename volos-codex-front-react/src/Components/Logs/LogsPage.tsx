import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LogsPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/logs', { replace: true });
  }, [navigate]);

  return null;
};

export default LogsPage;
