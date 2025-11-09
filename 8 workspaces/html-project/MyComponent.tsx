import React from 'react';
import styles from './MyComponent.module.css';

const MyComponent: React.FC = () => {
  return (
    <div className={styles.container}>
      Hello, World!
    </div>
  );
};

export default MyComponent;