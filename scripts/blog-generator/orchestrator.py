import os
from pathlib import Path
from api_client import UzbekCornerAPIClient
from research_agent import ResearchAgent
from writer_agent import WriterAgent
from image_agent import ImageAgent
import config

class BlogAutomationOrchestrator:
    def __init__(self):
        self.api_client = UzbekCornerAPIClient()

    def run_pipeline(self, dry_run=False):
        """
        Executes the full automated blog generation workflow:
        1. Fetch covered slugs from platform API.
        2. Brainstorm unique, fresh SEO topics.
        3. Pick the top topic and write a high-fidelity hook-driven article.
        4. Match, search, and download a stunning matching royalty-free image.
        5. Either write a dry-run local report or publish live over the APIs.
        """
        print("==================================================")
        print("🎬 STARTING UZBEK CORNER AUTOMATED BLOG PIPELINE")
        print(f"🔧 Mode: {'[DRY-RUN / MOCK]' if dry_run else '[LIVE PUBLISHING]'}")
        print("==================================================")

        # 1. Fetch covered topics
        existing_posts = self.api_client.get_existing_posts()
        existing_slugs = [post.get('slug') for post in existing_posts if post.get('slug')]
        print(f"📊 Found {len(existing_slugs)} existing slugs on server: {existing_slugs}")

        # 2. Ideate fresh topics
        researcher = ResearchAgent(existing_slugs=existing_slugs)
        fresh_ideas = researcher.generate_fresh_ideas()
        
        if not fresh_ideas:
            print("❌ No new topic ideas generated. Aborting pipeline.")
            return None

        # Pick the top fresh idea
        chosen_idea = fresh_ideas[0]
        print(f"\n🌟 Selected Topic for Generation:")
        print(f"   👉 Title: '{chosen_idea.get('title')}'")
        print(f"   👉 Slug:  '{chosen_idea.get('slug')}'")
        print(f"   👉 Focus:  {chosen_idea.get('focus')}\n")

        # 3. Draft the article body
        writer = WriterAgent(chosen_idea)
        draft = writer.write_post()

        # 4. Search and download corresponding image
        image_acquirer = ImageAgent(chosen_idea)
        local_img_path = image_acquirer.acquire_image()

        # 5. Handle Dry-Run or Live Publishing
        if dry_run:
            print("\n💾 [DRY-RUN] Simulating upload and publishing...")
            
            # Save the draft locally as a report
            report_file = config.LOCAL_TEMP_DIR / f"dryrun-{chosen_idea.get('slug')}.md"
            with open(report_file, 'w', encoding='utf-8') as f:
                f.write(f"# DRY-RUN GENERATION REPORT\n\n")
                f.write(f"**Target Slug**: {chosen_idea.get('slug')}\n")
                f.write(f"**Title Hook**: {draft.get('title')}\n")
                f.write(f"**SEO Excerpt (Meta Description)**: {draft.get('excerpt')}\n\n")
                f.write(f"**Local Downloaded Image Path**: {local_img_path}\n\n")
                f.write(f"## Article Body (HTML)\n")
                f.write(f"{draft.get('content')}\n")
                
            print(f"🎉 Dry-run complete! Complete draft saved locally to: {report_file}")
            print("==================================================")
            return {
                'success': True,
                'mode': 'dry_run',
                'report_path': str(report_file),
                'post': {
                    'slug': chosen_idea.get('slug'),
                    'title': draft.get('title'),
                    'excerpt': draft.get('excerpt'),
                    'content': draft.get('content'),
                    'imageUrl': local_img_path
                }
            }

        else:
            print("\n🚀 [LIVE] Initiating server sync...")
            try:
                # A. Upload the image to the local Next.js disk
                server_img_url = self.api_client.upload_image(
                    file_path=local_img_path,
                    slug=chosen_idea.get('slug')
                )
                print(f"✅ Image uploaded successfully! Server relative path: {server_img_url}")

                # B. Publish/upsert the blog post linking the uploaded image
                published_post = self.api_client.publish_blog_post(
                    slug=chosen_idea.get('slug'),
                    title=draft.get('title'),
                    content=draft.get('content'),
                    excerpt=draft.get('excerpt'),
                    image_url=server_img_url,
                    published=True
                )
                
                print("\n🎉 SUCCESS! BLOG POST LIVE ON UZBEK CORNER")
                print(f"   👉 Published Title: {published_post.get('title')}")
                print(f"   👉 Published URL:   https://uzbekcorner.uk/blog/{published_post.get('slug')}")
                print("==================================================")

                # Clean up local downloaded temp file
                if os.path.exists(local_img_path):
                    os.remove(local_img_path)
                    print("🧹 Cleaned up local temporary image file.")

                return {
                    'success': True,
                    'mode': 'live',
                    'post': published_post
                }
            except Exception as e:
                print(f"❌ Failed to publish post: {e}")
                print("==================================================")
                return {
                    'success': False,
                    'error': str(e)
                }

if __name__ == '__main__':
    orchestrator = BlogAutomationOrchestrator()
    orchestrator.run_pipeline(dry_run=True)
