import React from 'react';
import { useParams } from 'react-router-dom';

const ContractDetail = () => {
  const { address } = useParams();

  return (
    <div>
      <h1>合约详情</h1>
      <p>合约地址: {address}</p>
    </div>
  );
};

export default ContractDetail; 