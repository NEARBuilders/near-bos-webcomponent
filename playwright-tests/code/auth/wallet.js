return (
  <>
    <p data-testid="accountId">{context.accountId}</p>
    <Wallet
      provides={({ signIn, signOut }) => {
        return context.accountId ? (
          <button onClick={signOut}>Log out</button>
        ) : (
          <button onClick={signIn}>Open wallet selector</button>
        );
      }}
    />
  </>
);
