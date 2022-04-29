import { isExclude, isInclude, fileDisplay } from "../src/cdn";
import path from "path";

test("获取文件夹下所有文件", () => {
    const files = fileDisplay(path.resolve(__dirname, "test"),["WEB-INF\\"]);
    expect(files).not.toEqual([`${__dirname}\\test\\WEB-INF\\web.xml`])
})
test('判断文件是否被排除', () => {
    var filedir = path.join(__dirname, './WEB-INF/lib/');
    expect(isExclude(filedir, ["WEB-INF\\"])).toBe(true);
});

test('判断文件是否被包含', () => {
    var filedir = path.join(__dirname, './WEB-INF/lib/');
    expect(isInclude(filedir, ["lib\\"])).toBe(true);
});
