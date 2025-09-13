//Server.js
import app from "./app.js";

const PORT = 3000 ;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});