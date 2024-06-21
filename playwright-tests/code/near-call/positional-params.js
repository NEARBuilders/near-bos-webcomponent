const { contractName, methodName, args, gas, deposit } = props;

function handleClick() {
  try {
    Near.call(contractName, methodName, args, gas, deposit);
  } catch (error) {
    throw error;
  }
}

return <button onClick={handleClick}>click</button>;
