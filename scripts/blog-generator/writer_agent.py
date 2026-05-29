import json
from llm_service import LLMService

class WriterAgent:
    def __init__(self, topic_details):
        """
        - topic_details: dict with 'slug', 'title', 'focus'
        """
        self.slug = topic_details.get('slug')
        self.title = topic_details.get('title')
        self.focus = topic_details.get('focus')

    def write_post(self):
        """
        Drafts a high-engagement, hook-driven, semantic HTML blog post.
        Returns a dict: {'title': ..., 'excerpt': ..., 'content': ...}
        """
        system_instruction = (
            "You are an expert copywriter, food blogger, and SEO content developer. "
            "You write highly engaging, warm, emotional, and sensory stories in natural human language. "
            "You never use artificial intelligence cliches (e.g. 'delve', 'testament', 'tapestry', 'nestled', "
            "'moreover', 'in conclusion'). You write short, punchy paragraphs (2-3 sentences max) that flow smoothly. "
            "Your layout uses semantic HTML tags exclusively for structure."
        )

        prompt = f"""
        Write an incredibly interesting, sensory-rich blog post for 'Uzbek Corner London' based on this brainstormed topic:
        - Suggested Title: "{self.title}"
        - Topic Focus: {self.focus}
        - Target Slug: {self.slug}
        
        CRITICAL CONTENT & LAYOUT INSTRUCTIONS:
        1. **Title Hook**: Keep or enhance the title so it serves as an irresistible hook.
        2. **Semantic HTML inside content**: Format the body content with rich semantic tags:
           - Use `<h2>` and `<h3>` for structured, clear subheadings (helps Google crawlers read sections).
           - Wrap normal paragraphs in `<p>`.
           - Highlight/bold core phrases with `<strong>`.
           - Use `<ul>` and `<li>` lists for steps, ingredients, or reasons if relevant.
        3. **SEO Excerpt**: Provide a brief summary of the article in EXACTLY 140 to 155 characters (this is used as the HTML <meta name="description"> tag). It must be compelling and fit Google search results perfectly.
        4. **Natural Human Style**: Write with emotional appeal, active verbs, and visceral sensory details (e.g., the rising steam, the smell of wood charcoal, the blistered golden crust, the crunch of layered pastry). Keep the length interesting but concise (around 300 to 450 words total).
        
        Respond ONLY with a valid JSON object in this exact format:
        {{
          "title": "Why You'll Never Eat Generic Bread Again After Blistering Clay Oven Non",
          "excerpt": "Discover the centuries-old secrets behind baking authentic Uzbek non bread in our blistering hot clay tandoor oven right here in Streatham, London.",
          "content": "<h2>The Sacred Bread of Central Asia</h2><p>In Uzbekistan, bread is treated with absolute reverence...</p>"
        }}
        """

        print(f"✍️ Writing blog post content for topic: {self.title}...")
        raw_response = LLMService.get_llm_response(prompt, system_instruction=system_instruction, json_mode=True)
        
        try:
            # Clean possible markdown wrapping blocks (like ```json ... ```)
            cleaned_response = raw_response.strip()
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response[7:]
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]
            cleaned_response = cleaned_response.strip()

            parsed = json.loads(cleaned_response)
            
            # Basic schema validation
            if not parsed.get('title') or not parsed.get('content'):
                raise Exception("JSON response is missing required keys 'title' or 'content'")
                
            # If the excerpt is missing, craft a fallback
            if not parsed.get('excerpt'):
                parsed['excerpt'] = f"Experience the rich cultural history and mouthwatering flavors of authentic Uzbek {self.slug.replace('-', ' ')} at Uzbek Corner London."
                
            # Truncate excerpt if too long
            if len(parsed['excerpt']) > 165:
                parsed['excerpt'] = parsed['excerpt'][:160] + '...'
                
            return parsed
        except Exception as e:
            print(f"⚠️ Failed to parse written post JSON from LLM: {e}. Raw response: {raw_response}")
            # Dynamic fallback depending on slug content
            fallback_builder = LLMService._get_mock_fallback(f"write a blog post focusing on {self.slug}", False)
            return json.loads(fallback_builder)

if __name__ == '__main__':
    topic = {
        "slug": "perfect-shashlik-streatham-london",
        "title": "The Smoke, The Spice, The Sizzle: The Secret to Perfect Uzbek Lamb Shashlik",
        "focus": "Authentic coal grilling and spices."
    }
    writer = WriterAgent(topic)
    post = writer.write_post()
    print("Drafted Post:")
    print(json.dumps(post, indent=2))
