import { useEffect, useState } from "preact/hooks";

const KEY = "a29507eea26f010405870c";

type IframelyProps = {
  url: string;
};

export default function Iframely(props: IframelyProps) {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [html, setHtml] = useState({
    __html: "<div />",
  });

  useEffect(() => {
    if (props && props.url) {
      fetch(
        `https://cdn.iframe.ly/api/iframely?url=${encodeURIComponent(
          props.url
        )}&api_key=${KEY}&iframe=1&omit_script=1&ssl=1&card=0`
      )
        .then((res) => res.json())
        .then(
          (res) => {
            setIsLoaded(true);
            if (res.html) {
              setHtml({ __html: res.html });
            } else if (res.error) {
              setError({ code: res.error!, message: res.message });
            }
          },
          (error) => {
            setIsLoaded(true);
            setError(error);
          }
        );
    } else {
      setError({ code: 400, message: "Provide url attribute for the element" });
    }
  }, []);

  useEffect(() => {
    window.iframely && window.iframely.load();
  });

  if (error) {
    return (
      <div>
        Error: {error?.code} - {error?.message}
      </div>
    );
  } else if (!isLoaded) {
    return <div>Loading…</div>;
  } else {
    return <div className="iframely" dangerouslySetInnerHTML={html} />;
  }
}
