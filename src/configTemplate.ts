const configTemplate = `update_frequency = {{update_frequency}}

[cloudflare.account]
api_token = "{{cloudflare_api_token}}"

[cloudflare.zone]
zone_id = "{{cloudflare_zone_id}}"

[cloudflare.domains]
domains = {{cloudflare_domains}}

[panel]
enabled = {{panel_enabled}}
port = {{panel_port}}
password = "{{panel_password}}"`;

export default configTemplate;
