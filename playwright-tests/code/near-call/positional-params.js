const { contractName, methodName, args, gas, deposit, extra } = props;

function handleClick() {
  if (extra) {
    Near.call(contractName, methodName, args, gas, deposit, extra);
  } else if (contractName && !methodName && !args && !gas && !deposit) {
    Near.call(contractName);
  } else {
    Near.call(contractName, methodName, args, gas, deposit);
  }
}

return <button onClick={handleClick}>click</button>;
