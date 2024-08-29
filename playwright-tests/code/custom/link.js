const { to, href, text } = props;
return (
  <Link to={"/hello"} href={href}>
    hello! {text}
  </Link>
);
