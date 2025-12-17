
export const marketApi = {
  getRates: async () => {
    try {
      // Using the proxy we just set up
      const response = await fetch('/market-api/today.json');
      
      // Check content type to ensure we got JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // If we didn't get JSON, it's likely a proxy error or HTML page
        console.warn('Market API returned non-JSON response:', await response.text());
        return null;
      }

      if (!response.ok) throw new Error('Market data fetch failed');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      return null;
    }
  }
};
