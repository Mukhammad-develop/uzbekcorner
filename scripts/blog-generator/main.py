import argparse
import sys
from orchestrator import BlogAutomationOrchestrator
import config

def parse_args():
    parser = argparse.ArgumentParser(
        description="Uzbek Corner London — Automated SEO Blog Research, Writing & Auto-Publishing AI Application",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run the full pipeline in safe local dry-run mode (generates and writes report files under temp/)
  python main.py --dry-run
  
  # Run the pipeline and publish the generated post live to your Uzbek Corner website
  python main.py --publish
        """
    )
    
    group = parser.add_mutually_exclusive_group(required=False)
    group.add_argument(
        '--dry-run', 
        action='store_true',
        default=True,
        help="Execute the pipeline, download matching image, and output drafted post locally to markdown (Default)."
    )
    group.add_argument(
        '--publish',
        action='store_true',
        help="Execute the pipeline, upload image over API, and publish the post directly to the live database."
    )
    
    return parser.parse_args()

def main():
    args = parse_args()
    
    # Load and validate settings
    config.validate_config()
    
    # Determine execution mode
    # If --publish is selected, dry_run is False
    dry_run = not args.publish
    
    try:
        orchestrator = BlogAutomationOrchestrator()
        result = orchestrator.run_pipeline(dry_run=dry_run)
        
        if result and result.get('success'):
            print("\n✨ Process finished successfully!")
            sys.exit(0)
        else:
            print("\n❌ Process finished with errors or was aborted.")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⚠️ Process interrupted by user. Exiting.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Uncaught Exception: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
