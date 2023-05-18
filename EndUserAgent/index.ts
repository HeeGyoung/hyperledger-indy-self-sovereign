import App from "./app";
const port = 9999;

App.app.listen(port, async () => {
   console.log(`Enduser-Server is running at localhost:${port}`);
});