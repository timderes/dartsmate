import { Html, Head, Main, NextScript } from "next/document";
import { ColorSchemeScript } from "@mantine/core";
import i18next from "../../next-i18next.config";

const Document = () => {
  return (
    <Html lang={i18next.i18n.defaultLocale}>
      <Head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </Head>
      <body id="draggable">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
