import React, { useEffect, useState } from "react";

export const CustomElementWithHooks = ({ message, sharedFunction }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Component mounted, message:', message);
    return () => console.log('Component unmounted');
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => sharedFunction()}>Shared Function</button>
    </div>
  );
};