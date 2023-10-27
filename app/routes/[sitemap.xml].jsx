import sitemap from "../api/sitemap.server";

export const loader = async () => {

    const [data, error] = await sitemap();

    if (!!error) {
        return new Response("System error", {
            status: 500,
            headers: {
                "Content-Type": "application/text",
                "xml-version": "1.0",
                "encoding": "UTF-8"
            }
        });
    }

    const content = `
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
            <loc>https://www.wikid.app/</loc>
            <priority>1.0</priority>
            <changefreq>always</changefreq>
        </url>
        <url>
            <loc>https://www.wikid.app/signup</loc>
            <priority>1.0</priority>
            <changefreq>monthly</changefreq>
        </url>
        <url>
            <loc>https://www.wikid.app/login</loc>
            <priority>1.0</priority>
            <changefreq>monthly</changefreq>
        </url>
        <url>
            <loc>https://www.wikid.app/terms</loc>
            <priority>1.0</priority>
            <changefreq>monthly</changefreq>
        </url>
        ${data.communities.map(community => `
        <url>
            <loc>https://www.wikid.app/c/${community.handle}</loc>
            <priority>1.0</priority>
            <changefreq>always</changefreq>
        </url>
        ${community.channels.map(channel => `
        <url>
            <loc>https://www.wikid.app/c/${community.handle}/${channel.handle}</loc>
            <priority>1.0</priority>
            <changefreq>always</changefreq>
        </url>
        `)}
        `)}
      </urlset>
      `;

    return new Response(content, {
        status: 200,
        headers: {
            "Content-Type": "application/xml",
            "xml-version": "1.0",
            "encoding": "UTF-8"
        }
    });
};
