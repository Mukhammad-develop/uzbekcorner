import os
import json
import requests
import config

class LLMService:
    @staticmethod
    def get_llm_response(prompt, system_instruction=None, json_mode=False):
        """
        Unified wrapper that detects available keys and queries the appropriate LLM provider.
        Priority: Gemini -> OpenAI -> AbacusAI -> Fallback (Mock)
        """
        # 1. Google Gemini Provider
        if config.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=config.GEMINI_API_KEY)
                
                generation_config = {}
                if json_mode:
                    generation_config["response_mime_type"] = "application/json"
                
                model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    generation_config=generation_config,
                    system_instruction=system_instruction
                )
                
                print("🤖 Querying Gemini LLM (gemini-1.5-flash)...")
                response = model.generate_content(prompt)
                return response.text.strip()
            except Exception as e:
                print(f"⚠️ Gemini API failed: {e}. Trying next provider...")

        # 2. OpenAI Provider
        if config.OPENAI_API_KEY:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=config.OPENAI_API_KEY)
                
                messages = []
                if system_instruction:
                    messages.append({"role": "system", "content": system_instruction})
                messages.append({"role": "user", "content": prompt})
                
                response_format = {"type": "json_object"} if json_mode else None
                
                print("🤖 Querying OpenAI LLM (gpt-4o-mini)...")
                res = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    response_format=response_format,
                    temperature=0.7
                )
                return res.choices[0].message.content.strip()
            except Exception as e:
                print(f"⚠️ OpenAI API failed: {e}. Trying next provider...")

        # 3. Abacus.AI Chat Provider (Fallback custom implementation)
        if config.ABACUSAI_API_KEY:
            try:
                # Abacus.AI offers OpenAI-compatible or direct API endpoints.
                # Here we call their general deployment API if configured, otherwise we fall back.
                print("🤖 Querying Abacus.AI LLM API...")
                url = "https://api.abacus.ai/api/v0/chatCompletion"
                headers = {
                    "Authorization": f"Bearer {config.ABACUSAI_API_KEY}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "messages": [
                        {"role": "system", "content": system_instruction or "You are an expert copywriter."},
                        {"role": "user", "content": prompt}
                    ]
                }
                res = requests.post(url, headers=headers, json=payload, timeout=15)
                if res.status_code == 200:
                    return res.json().get("result", {}).get("content", "").strip()
                else:
                    print(f"⚠️ Abacus.AI failed with status {res.status_code}. Using mock fallback.")
            except Exception as e:
                print(f"⚠️ Abacus.AI integration error: {e}. Using mock fallback.")

        # 4. High-Fidelity Static Mock Fallback (when no API key is available or all failed)
        print("💡 No LLM API keys succeeded. Generating high-quality mock data natively...")
        return LLMService._get_mock_fallback(prompt, json_mode)

    @staticmethod
    def _get_mock_fallback(prompt, json_mode):
        """
        Provides high-fidelity, topic-specific pre-written responses if no LLM credentials are valid.
        """
        # If looking for ideas/research topics (json mode)
        if json_mode and "ideas" in prompt.lower():
            mock_ideas = {
                "ideas": [
                    {
                        "slug": "secrets-of-traditional-clay-oven-non",
                        "title": "Why Londoners Can't Get Enough of Our Traditional Clay Oven Non",
                        "focus": "The secret method of slapping yeasted non dough inside the high-heat tandoor."
                    },
                    {
                        "slug": "art-of-perfect-uzbek-lamb-shashlik",
                        "title": "The Smoke, The Spice, The Sizzle: The Secret to Perfect Uzbek Lamb Shashlik",
                        "focus": "Marination methods with coriander and cumin seeds, and grilling over birch coals."
                    },
                    {
                        "slug": "manti-dumplings-uzbekistan-comfort-food",
                        "title": "Traditional Uzbek Manti: Hand-Rolled Dumplings That Will Warm Your Soul",
                        "focus": "The physical art of rolling razor-thin dough, stacking layers in the mantishnitsa steamer, and serving with dynamic fresh sour cream."
                    }
                ]
            }
            return json.dumps(mock_ideas)

        # If looking for a blog post body (HTML layout)
        if "write a blog post" in prompt.lower() or "content" in prompt.lower():
            import re
            # Check which topic we are writing using safe word boundaries
            if re.search(r'\bshashlik', prompt.lower()):
                return LLMService._get_mock_shashlik_post()
            elif re.search(r'\bmanti\b|\bdumpling', prompt.lower()):
                return LLMService._get_mock_manti_post()
            else:
                return LLMService._get_mock_non_post()

        return "Default fall back response."

    @staticmethod
    def _get_mock_non_post():
        post_data = {
            "title": "Why Londoners Can't Get Enough of Our Traditional Clay Oven Non",
            "excerpt": "Discover the centuries-old secrets behind baking authentic Uzbek non bread in our blistering hot clay tandoor oven.",
            "content": """
                <h2>The Sacred Heart of the Uzbek Table</h2>
                <p>In Uzbekistan, bread—known as <strong>Non</strong>—is more than just a side dish. It is a sacred symbol of hospitality, community, and tradition. It is never placed upside down, and it is always broken by hand with respect. Now, we are bringing that exact, authentic baking experience right to the heart of Streatham, London.</p>
                
                <h3>Baking at 400 Degrees in the Clay Tandoor</h3>
                <p>What makes our Obi Non so incredibly flaky on the outside and pillowy on the inside? It all comes down to the tandoor. Our bakers hand-slap the stamped, yeasted dough directly onto the glowing, blistering clay walls of our traditional oven. Cooked within minutes over intense radiant heat, it locks in a rich, smokey flavor you simply cannot replicate in a standard deck oven.</p>
                
                <h3>Sensory Perfection in Every Bite</h3>
                <p>As you tear off your first warm piece, you'll hear the crisp crackle of the golden crust sprinkled with black sesame seeds. The aroma of toasted wheat and charcoal immediately fills the air. Perfect on its own, or dipped into a piping hot bowl of Shurpa, our non bread is a piece of Central Asian history served fresh daily.</p>
            """
        }
        return json.dumps(post_data)

    @staticmethod
    def _get_mock_shashlik_post():
        post_data = {
            "title": "The Smoke, The Spice, The Sizzle: The Secret to Perfect Uzbek Lamb Shashlik",
            "excerpt": "Learn the ancient Central Asian secrets to marinating and charcoal-grilling succulent shashlik kebabs over glowing birch coals.",
            "content": """
                <h2>More Than Just a Kebab</h2>
                <p>True Uzbek <strong>Shashlik</strong> is not just fast food; it is a celebrated culinary art. Skewered lamb shoulder, meticulously layered with rich tail fat, is grilled close to glowing coals. The fat renders, dripping onto the embers to create a signature rising smoke that seasons the meat from the inside out.</p>
                
                <h3>The 12-Hour Spice Marination Secret</h3>
                <p>The key to our tender skewers lies in the time-tested marination. We steep fresh lamb cuts in mineral water, freshly sliced white onions, crushed coriander seeds, aromatic cumin, black pepper, and a touch of vinegar for a minimum of 12 hours. This slowly breaks down the fibers, infusing every single grain of meat with deep, earthy undertones.</p>
                
                <h3>Straight From the Embers to Your Table</h3>
                <p>Our grill masters cook every skewer over authentic birch coals. We serve them scorching hot, piled high with crisp, sumac-dusted red onions and fresh vinegar. One bite of this smokey, succulent lamb will transport you directly from London to the lively street stalls of Tashkent.</p>
            """
        }
        return json.dumps(post_data)

    @staticmethod
    def _get_mock_manti_post():
        post_data = {
            "title": "Traditional Uzbek Manti: Hand-Rolled Dumplings That Will Warm Your Soul",
            "excerpt": "A deep dive into the delicate craftsmanship, layered spices, and rich comfort of authentic steamed manti dumplings.",
            "content": """
                <h2>Handcrafted Comfort in Streatham</h2>
                <p>When London weather turns chilly, there is only one dish that can warm your soul from the inside out: a fresh plate of steaming <strong>Manti</strong>. These delicate, hand-folded dumplings are packed with seasoned chopped lamb, sweet onions, and freshly ground black pepper, steamed slowly in a traditional multi-tiered metal mantishnitsa.</p>
                
                <h3>The Art of the Razor-Thin Fold</h3>
                <p>The secret of perfect manti lies in the dough. Our chefs roll it out until it is paper-thin yet resilient enough to hold the piping-hot juices inside. The dough squares are filled, then folded with double-crossed corners to form beautiful, pillow-like envelopes. As they steam, the sweet onions render down, blending with the lamb juices to form a rich broth inside each dumpling.</p>
                
                <h3>How to Eat Manti Like a Local</h3>
                <p>Forget the fork and knife! To enjoy manti, you must eat them with your hands. Take a small bite to release the warm broth, spoon in a dollop of fresh, cool sour cream (suzma), and savor the contrast of hot, savory meat with tangy, cold cream. It is the ultimate Central Asian comfort food experience.</p>
            """
        }
        return json.dumps(post_data)
