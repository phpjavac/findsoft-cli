import fs from "fs"
import path from "path"
const newConfig = () => {
    fs.copyFileSync(path.resolve(__dirname, "static/findsoft.config.json"), `${process.cwd()}/findsoft.config.json`)
}
export default newConfig;
