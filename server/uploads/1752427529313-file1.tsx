const App = () => {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");

  return <div dangerouslySetInnerHTML={{ __html: name }} />; // DOM XSS
};
