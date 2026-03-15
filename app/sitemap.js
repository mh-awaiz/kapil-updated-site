export default function sitemap() {
  const baseUrl = "https://kapilstore.in";
  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/groceries`, lastModified: new Date() },
    { url: `${baseUrl}/groceries/snacks-drinks`, lastModified: new Date() },
    { url: `${baseUrl}/groceries/beauty-personal-care`, lastModified: new Date() },
    { url: `${baseUrl}/groceries/home-lifestyle`, lastModified: new Date() },
    { url: `${baseUrl}/groceries/food-veg`, lastModified: new Date() },
    { url: `${baseUrl}/groceries/food-nonveg`, lastModified: new Date() },
  ];
}
