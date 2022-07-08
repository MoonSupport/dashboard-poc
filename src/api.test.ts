import api from "./api";

const TEST_URL_DOMAIN = "http://test.com";
const TEST_URL = `${TEST_URL_DOMAIN}/{stime}/{etime}`;

describe("[api]", () => {
  const now = new Date().getTime();
  describe("getPath", () => {
    test("URL과 함께 파라미터를 리터럴로 감싸면 인자와 매핑되어 replace된 URL 값을 반환한다.", () => {
      const includedURL = api.getPath(TEST_URL, {
        stime: now,
        etime: now,
      });
      const onlyParam = api.getPath("{stime}{etime}", {
        stime: now,
        etime: now,
      });

      expect(includedURL).toBe(`${TEST_URL_DOMAIN}/${now}/${now}`);
      expect(onlyParam).toBe(`${now}${now}`);
    });

    test("파라미터를 인자로 넘기지 않으면 replace 되지 않는다.", () => {
      const includedURL = api.getPath(TEST_URL);
      expect(includedURL).toBe(`${TEST_URL_DOMAIN}/{stime}/{etime}`);
    });
  });
});
