#!/bin/bash

# 🚀 Automated Deployment Script for Tenant Portal
# Usage: ./scripts/deploy.sh [type] [message]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="tenant-portal"
PRODUCTION_URL="https://tenant-portal-mgume5fpp-jumaane-beys-projects.vercel.app"
VERCEL_PROJECT="tenant-portal"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}🚀 $1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to check if we're in the right directory
check_directory() {
    if [[ ! -f "package.json" ]] || [[ ! -f "next.config.ts" ]]; then
        print_error "Not in the correct project directory. Please run from the tenant-portal root."
        exit 1
    fi
}

# Function to check Git status
check_git_status() {
    if [[ -n $(git status --porcelain) ]]; then
        print_warning "You have uncommitted changes:"
        git status --short
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled."
            exit 1
        fi
    fi
}

# Function to run tests and build
run_tests_and_build() {
    print_status "Running tests and build..."
    
    # Install dependencies if needed
    if [[ ! -d "node_modules" ]]; then
        print_status "Installing dependencies..."
        npm install
    fi
    
    # Run linting
    print_status "Running linting..."
    npm run lint
    
    # Run type checking
    print_status "Running type checking..."
    npm run type-check
    
    # Build the application
    print_status "Building application..."
    npm run build
    
    print_success "Tests and build completed successfully!"
}

# Function to commit and push changes
commit_and_push() {
    local commit_type=$1
    local custom_message=$2
    
    # Generate commit message
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local commit_message
    
    case $commit_type in
        "quick")
            commit_message="⚡ Quick Deploy: $timestamp"
            ;;
        "feature")
            commit_message="✨ Feature Deploy: $timestamp"
            ;;
        "fix")
            commit_message="🐛 Bug Fix: $timestamp"
            ;;
        "prod")
            commit_message="🚀 Production Deploy: $timestamp"
            ;;
        "custom")
            commit_message="$custom_message"
            ;;
        *)
            commit_message="�� Auto Deploy: $timestamp"
            ;;
    esac
    
    print_status "Committing changes..."
    git add .
    git commit -m "$commit_message"
    
    print_status "Pushing to repository..."
    git push origin main
    
    print_success "Changes committed and pushed successfully!"
}

# Function to deploy to Vercel
deploy_to_vercel() {
    local deploy_type=$1
    
    print_status "Deploying to Vercel..."
    
    if [[ $deploy_type == "prod" ]]; then
        print_status "Deploying to production..."
        vercel --prod
    else
        print_status "Creating preview deployment..."
        vercel
    fi
    
    print_success "Deployment completed!"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Wait a moment for deployment to complete
    sleep 5
    
    # Check if the site is accessible
    if curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL" | grep -q "200"; then
        print_success "Deployment verified! Site is accessible."
    else
        print_warning "Site might still be deploying. Please check manually."
    fi
}

# Function to show deployment info
show_deployment_info() {
    print_header "Deployment Information"
    echo -e "${CYAN}📱 Production URL:${NC} $PRODUCTION_URL"
    echo -e "${CYAN}📊 Analytics:${NC} https://analytics.google.com"
    echo -e "${CYAN}🔧 Vercel Dashboard:${NC} https://vercel.com/dashboard"
    echo -e "${CYAN}📋 GitHub Actions:${NC} https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/')/actions"
    echo -e "${CYAN}📝 Commit Hash:${NC} $(git rev-parse --short HEAD)"
    echo -e "${CYAN}👤 Author:${NC} $(git config user.name)"
    echo -e "${CYAN}⏰ Timestamp:${NC} $(date)"
}

# Function to show help
show_help() {
    print_header "Deployment Script Help"
    echo "Usage: ./scripts/deploy.sh [type] [message]"
    echo ""
    echo "Deployment Types:"
    echo "  quick     - Quick deploy (no tests, just push)"
    echo "  feature   - Feature deploy (with tests)"
    echo "  fix       - Bug fix deploy (with tests)"
    echo "  prod      - Production deploy (full pipeline)"
    echo "  custom    - Custom deploy with message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/deploy.sh quick"
    echo "  ./scripts/deploy.sh feature"
    echo "  ./scripts/deploy.sh prod"
    echo "  ./scripts/deploy.sh custom 'Custom deployment message'"
    echo ""
    echo "Available Commands:"
    echo "  status    - Show current status"
    echo "  rollback  - Show recent commits for rollback"
    echo "  clean     - Clean build cache"
    echo "  help      - Show this help"
}

# Function to show status
show_status() {
    print_header "Current Status"
    
    echo -e "${CYAN}📋 Git Status:${NC}"
    git status --short
    
    echo -e "\n${CYAN}📊 Recent Commits:${NC}"
    git log --oneline -5
    
    echo -e "\n${CYAN}🏗️ Build Status:${NC}"
    if npm run build > /dev/null 2>&1; then
        print_success "Build successful!"
    else
        print_error "Build failed!"
    fi
}

# Function to show rollback options
show_rollback() {
    print_header "Rollback Options"
    echo -e "${CYAN}📋 Recent Commits:${NC}"
    git log --oneline -10
    
    echo -e "\n${YELLOW}To rollback to a specific commit:${NC}"
    echo "git reset --hard <commit-hash>"
    echo "git push --force origin main"
}

# Function to clean cache
clean_cache() {
    print_header "Cleaning Cache"
    print_status "Removing build cache..."
    rm -rf .next
    rm -rf node_modules/.cache
    print_success "Cache cleaned successfully!"
}

# Main deployment function
main() {
    local deploy_type=${1:-"auto"}
    local custom_message=$2
    
    print_header "Starting Deployment"
    
    # Check if we're in the right directory
    check_directory
    
    # Handle special commands
    case $deploy_type in
        "help")
            show_help
            exit 0
            ;;
        "status")
            show_status
            exit 0
            ;;
        "rollback")
            show_rollback
            exit 0
            ;;
        "clean")
            clean_cache
            exit 0
            ;;
    esac
    
    # Check Git status
    check_git_status
    
    # Run tests and build (except for quick deploys)
    if [[ $deploy_type != "quick" ]]; then
        run_tests_and_build
    fi
    
    # Commit and push changes
    commit_and_push "$deploy_type" "$custom_message"
    
    # Deploy to Vercel (except for quick deploys)
    if [[ $deploy_type != "quick" ]]; then
        deploy_to_vercel "$deploy_type"
        verify_deployment
    fi
    
    # Show deployment information
    show_deployment_info
    
    print_success "Deployment completed successfully! 🎉"
}

# Run main function with all arguments
main "$@"
