const isDevEnv = true;

if (isDevEnv) {
  return <Workspace enableHotReload={true} provides={({ redirectMap }) => {
    return (
      <>
        <p>{JSON.stringify(redirectMap)}</p>
        <Widget src="${config_account}/widget/Parent" config={{ redirectMap }} />
      </>
    ); 
  }} />;
} else {
  return <Widget src="${config_account}/widget/Parent" />;
}