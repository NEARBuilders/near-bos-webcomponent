const { tx } = props;

function handleClick() {
  Near.call(tx);
}

return <button onClick={handleClick}>click</button>;
