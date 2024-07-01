return (
  <>
    <p data-testid="accountId">{context.accountId}</p>
    <Wallet
      provides={({ logOut }) => {
        return context.accountId ? (
          <button onClick={logOut}>Log out</button>
        ) : (
          <button id="open-walletselector-button" type="button">
            Open wallet selector
          </button>
        );
      }}
    />
  </>
);
