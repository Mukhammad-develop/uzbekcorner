import json
from llm_service import LLMService

class ResearchAgent:
    def __init__(self, existing_slugs=None):
        self.existing_slugs = existing_slugs or []

    def generate_fresh_ideas(self):
        """
        Brainstorms fresh, hook-filled SEO topics tailored to Uzbek Corner London.
        Excludes existing slugs to prevent duplicate topics.
        """
        existing_list_str = ", ".join(self.existing_slugs) if self.existing_slugs else "None"
        
        system_instruction = (
            "You are an elite SEO strategist and lead copywriter for 'Uzbek Corner', a premium restaurant "
            "and cultural hub in Streatham, London. Your job is to brainstorm highly engaging, viral, "
            "and hook-filled blog post topics. The articles must focus strictly on traditional Uzbek food "
            "(plov, somsa, manti, shashlik, non bread), tea ceremonies, Central Asian culinary secrets, "
            "and London local dining guides. Avoid generic titles. Titles must be click-worthy, SEO-optimized "
            "hooks in natural human language."
        )

        prompt = f"""
        Brainstorm exactly 3 fresh, exciting blog post ideas.
        
        CRITICAL CONSTRAINT: You must NOT write about topics that cannibalize or duplicate these existing slugs:
        [{existing_list_str}]
        
        For each idea, provide:
        1. A compelling, hook-filled title (should be an active curiosity gap, a secret, or local London angle).
        2. A URL-friendly, lowercase slug (hyphenated).
        3. A short focus description outlining the core topic.
        
        Respond ONLY with a valid JSON object in this exact format:
        {{
          "ideas": [
            {{
              "slug": "secrets-of-flaky-tandoor-somsa",
              "title": "Why You'll Never Eat Bakery Pastry Again After Trying Tandoor Somsa",
              "focus": "Lamination techniques, baking in tandoor, lamb and onion stuffing flavor profile."
            }}
          ]
        }}
        """

        print("🔍 Brainstorming fresh SEO topics...")
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
            ideas = parsed.get("ideas", [])
            
            # Additional filter to ensure no direct duplication with existing slugs
            fresh_ideas = [idea for idea in ideas if idea.get('slug') not in self.existing_slugs]
            if not fresh_ideas:
                # Return all if filtering wiped it out, or let it fall back
                return ideas
            return fresh_ideas
        except Exception as e:
            print(f"⚠️ Failed to parse JSON from LLM: {e}. Raw response: {raw_response}")
            # Safe basic fallbacks
            return [
                {
                    "slug": "secrets-of-traditional-clay-oven-non",
                    "title": "Why Londoners Can't Get Enough of Our Traditional Clay Oven Non",
                    "focus": "The physical art of slapping yeasted non bread dough inside the blisteringly hot clay walls of the tandoor."
                }
            ]

if __name__ == '__main__':
    agent = ResearchAgent(existing_slugs=['secrets-of-authentic-uzbek-plov'])
    ideas = agent.generate_fresh_ideas()
    print("Brainstormed Ideas:")
    print(json.dumps(ideas, indent=2))
