return (
  <>
    <p data-testid="accountId">{context.accountId}</p>
    <Wallet
      provides={({ signOut }) => {
        return context.accountId ? (
          <button onClick={signOut}>Log out</button>
        ) : (
          <button id="open-walletselector-button" type="button">
            Open wallet selector
          </button>
        );
      }}
    />
  </>
);
