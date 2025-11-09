# Entrypoint for HTML Project bot

def main():
    import sys
    import os
    sys.path.append(r"C:\\")
    sys.path.append(r"C:\n8ked_bot")
    from n8ked_bot.security.security_orchestrator import SecurityOrchestrator

    security = SecurityOrchestrator()

    def handle_html_message(ip_address, message, source_module=None):
        security_check = security.process_incoming_request(
            ip_address=ip_address,
            user_input=message,
            source_module=source_module
        )
        if security_check["status"] != "approved":
            print(f"Blocked: {security_check['reason']}")
            return
        cleaned_data = security_check["cleaned_data"]
        # ... your bot logic here using cleaned_data

    """Start the HTML Project bot."""
    # Example usage
    handle_html_message("127.0.0.1", "test input", "html_project")
    """Start the HTML Project bot."""
    # Example usage
    handle_html_message("127.0.0.1", "test input", "html_project")

if __name__ == "__main__":
    main()
