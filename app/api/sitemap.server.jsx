import { hotRequest } from "../wikid.server";
import env from "../environment.server";

const sitemap = async () => {
    const request = {
      url: `${env.readHotUrl}/internal/sitemap`,
      method: 'get',
      postData: null,
      jwt: null
    }
    return hotRequest(request);
}

export default sitemap;
