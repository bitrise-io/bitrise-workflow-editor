def strings
    {
        constants: {
            default_save_delay_in_milliseconds: 1000,
            meta_bundle_ids: {
                bitrise_io: "bitrise.io"
            },
            algolia: {
                appID: "HI1538U2K4",
                apiKey: "708f890e859e7c44f309a1bbad3d2de8"
            },
            datadog: {
                apiKey: "pub3ee8559ad1bc8c3c8cd788bd71fe5995"
            },
            ld: {
                client_id_production: "5e70774c8a726707851d2fff",
                client_id_staging: "5e70774c8a726707851d2ffe"
            }
        },
        strings: {
            meta: {
                title: "Bitrise Workflow editor"
            },
            main: {
                menus: {
                    workflows: "Workflows",
                    code_signing: "Code Signing & Files",
                    secrets: "Secrets",
                    env_vars: "Env Vars",
                    triggers: "Triggers",
                    stack: "Stack",
                    stacks_and_machines: "Stacks & Machines",
                    licenses: "Licenses",
                    yml: "Configuration YAML"
                },
                discard: "Discard",
                save: "Save",
                saved: "Saved",
                load_menu_progress: {
                    loading: "Loading tab, wait a sec...",
                    load_error: "Failed to load menu."
                },
                load_progress: {
                    loading: "Loading, wait a sec...",
                    saving: "Saving, wait a sec...",
                    save_error: "Error saving!"
                },
                confirm_tab_change_save_popup: {
                    title: "Unsaved changes",
                    details: "You need to save your unsaved changes before leaving this tab.",
                    save: "Save",
                    cancel: "Cancel"
                },
                tab_close_confirm_message: "You have unsaved changes. Press OK to confirm, or Cancel to stay on the current page.",
                footer: {
                    editor_open_source: "The Workflow Editor is now open source",
                    check_out_source_code: "Check out the source code <a href='<url>' target='_blank' rel='noreferrer noopener'>on GitHub!</a>"
                }
            },
            alert_popup: {
                ok: "OK",
                cancel: "Cancel"
            },
            confirm_popup: {
                yes: "Yes",
                no: "No"
            },
            workflows: {
                load_workflows_progress: {
                    in_progress: "Loading workflows...",
                    error: "Failed to load workflows: <error>"
                },
                load_secret_environment_keys_progress: {
                    in_progress: "Loading secret environment variable keys...",
                    error: "Failed to load secret environment variable keys."
                },
                select_workflow_placeholder: "Workflow",
                run_workflows: {
                    postfix: "workflow",
                    select: "Select a Workflow from the list below:"
                },
                add_run_workflow: {
                    before_run: {
                        action: "Add Workflow before",
                        action_prefix: "Add workflow before"
                    },
                    after_run: {
                        action: "Add Workflow after",
                        action_prefix: "Add workflow after"
                    },
                    placeholder: "Select workflow",
                    done: "Done",
                    cancel: "Cancel"
                },
                rearrange: {
                    action: "Rearrange",
                    drag_n_drop: "Drag & drop to change Workflow execution order",
                    done: "Done",
                    cancel: "Cancel"
                },
                delete_workflow: "Delete Workflow",
                env_vars: {
                    no_env_vars: "No Env Vars for this Workflow yet",
                    title: "Workflow Environment Variables"
                },
                description: {
                    header: "<workflow_id> workflow's description",
                    no_description: "Click here to add a description..."
                },
                summary: {
                    header: "<workflow_id> workflow's summary",
                    no_summary: "Click here to add a summary..."
                },
                steps: {
                    start: "Start",
                    end: "End",
                    add: {
                        search_placeholder: "Search steps",
                        all_project_types: "All",
                        search_in_all_steps: "Search in All category",
                        create_new_step: "Would you like to create a new step?",
                        show_all_steps: "Show all steps",
                        categories: {
                            new_releases: "New releases",
                            essentials: "Essentials",
                            test: "Test"
                        },
                        load: {
                            in_progress: "Loading steps, wait a sec..."
                        }
                    },
                    verified: "Verified",
                    deprecated: "Deprecated",
                    community_created: "Community created",
                    clone_popover_info: "Clone this step",
                    source_popover_info: "Source code",
                    version: "Version: <version>",
                    branch: "Branch: <version>",
                    always_latest: "Always latest",
                    latest_version: "Step\\'s latest version is: <latest_version>",
                    exact_version_remark: "Step version set to \\“<version>\\” in the <b>bitrise.yml</b> file",
                    patch_update_remark: "You will get patch updates on this step",
                    minor_update_remark: "You will get minor and patch updates on this step",
                    is_always_run: "Run even if previous Step(s) failed",
                    run_if_title: "Additional run conditions",
                    major_version_change_title: "Major version change",
                    major_version_change_desc: "A new major version likely contains breaking changes in the step behavior. Please check the <a href='<url>' target='_blank'>release notes</a>.",
                    inputs_removed_desc: "<br><b>The following inputs are not available in the selected version anymore: <inputList></b>",
                    invalid_version: {
                        title: "Invalid version",
                        message: "This version does not exist. Please select a valid version."
                    }
                },
                inputs: {
                    header: "Input variables",
                    change: "Change",
                    dont_change_info: "Changing this input is not recommended, thus it is only available in YML mode.",
                    empty_value: "no value",
                    value_placeholder: "Enter value",
                    required: "required",
                    sensitive: "sensitive",
                    will_be_replaced: "Environment Variables will be replaced in input by the Bitrise CLI before starting the Step.",
                    wont_be_replaced: "Environment Variables won't be replaced in input by the Bitrise CLI before starting the Step.",
                    insert_variable: {
                        action: "Insert variable",
                        key_filter_placeholder: "Filter by key",
                        load_progress: "Loading insertable variables, wait a sec...",
                        source: {
                            bitriseio: "from bitrise.io",
                            bitrise_cli: "from bitrise CLI",
                            code_signing_files: "from code signing files",
                            secrets: "from secrets",
                            app_env_vars: "from app env vars",
                            workflow_env_vars: "env var of workflow: <workflow_id>",
                            step_outputs: "output of step: <step_display_name>"
                        }
                    },
                    sensitive_warning_message: {
                        info: "This input holds sensitive information.",
                        prompt_with_button_label: {
                            part_1_text: "You can only use",
                            part_2_button_label: "secrets",
                            part_3_text: "to securely reference it."
                        }
                    },
                    select_secret_variable: {
                        action: "Select secret variable"
                    },
                    insert_secret: {
                        action: "Insert variable",
                        load_progress: "Loading insertable secrets, wait a sec...",
                        save_progress: "Saving insertable secret, wait a sec...",
                        create_new_secret_env_var_label: "Create New Secret Env Var",
                        choose_secret_env_var_label: "Choose Secret Env Var",
                        there_is_no_secrets_in_the_list: "There are no secrets added to this app yet.",
                        key_filter_placeholder: "Filter by key",
                        source: {
                            secret: "from secrets"
                        }
                    }
                },
                outputs: {
                    header: "This step will generate these output variables:",
                    no_outputs: "No output variables generated by this step",
                    no_description: "No description for this output variable"
                },
                confirm_workflow_delete_popup: {
                    title: "Are you sure?",
                    details: "Are you sure you want to delete the <workflow_id> workflow?"
                }
            },
            code_signing: {
                available_project_types_load: "Loading, wait a sec...",
                expose_for_pr_popover_content: "You can decide which files should be exposed for / available in Pull Request builds.<br> Be careful, exposing a secret is a potential security risk.",

                manual_code_signing: {
                    header: {
                        title: "Update Manually",
                        description: "If you prefer the hard way"
                    }
                },
                notification: {
                    title: "New way of code signing",
                    description: 'Manage your code signing and files in the App settings.',
                    link: 'Go to App settings'
                },
                prov_profile: {
                    header: {
                        card_title: "Provisioning profile",
                        expose_for_pull_requests: "Expose for Pull Requests",
                        expose_for_pr: "Expose for PR",
                        actions: {
                            delete_all: "Delete all"
                        }
                    },
                    article: {
                        details: {
                            expires_on_label: "Expires on",
                            expired_label: "Expired",
                            export_type_label: "Export type",
                            team_data_label: "Team",
                            bundle_id_label: "Bundle ID",
                            show_prov_profile_validated_details_button: "Show matching Certificates, Devices & Capabilities"
                        },
                        actions: {
                            download: "Download",
                            protect: "Make protected",
                            delete: "Delete"
                        },
                        expose: {
                            is_expose: "Expose for Pull Request"
                        }
                    },
                    prov_profile_details_popup: {
                        menus: {
                            matching_certificates: "Included Certificates",
                            devices: "Devices",
                            capabilities: "Capabilities"
                        },
                        device_registration_details: {
                            not_registered: "Not registered on Bitrise",
                            registered: "Registered on Bitrise by"
                        },
                        matching_certificates_details: {
                            missing_or_expired_notice_part_1: "There is no matching certificate right now. They are either missing or expired.",
                            missing_or_expired_notice_part_2: "Upload at least one certificate that is matching with one of your provisioning profile."
                        },
                        devices: {
                            udid: "UDID"
                        },
                        identities: {
                            expired: "Expired",
                            uploaded: "Uploaded",
                            missing: "Missing"
                        },
                        capabilities: {
                            "com.apple.security.application-groups": "App Groups",
                            "com.apple.developer.in-app-payments": "Apple Pay",
                            "com.apple.developer.associated-domains": "Associated Domains",
                            "com.apple.developer.healthkit": "HealthKit",
                            "com.apple.developer.homekit": "HomeKit",
                            "com.apple.developer.networking.HotspotConfiguration": "Hotspot",
                            "com.apple.InAppPurchase": "In-App Purchase",
                            "inter-app-audio": "Inter-App Audio",
                            "com.apple.developer.networking.multipath": "Multipath",
                            "com.apple.developer.networking.networkextension": "Network Extensions",
                            "com.apple.developer.nfc.readersession.formats": "NFC Tag Reading",
                            "com.apple.developer.networking.vpn.api": "Personal VPN",
                            "aps-environment": "Push Notifications",
                            "com.apple.developer.siri": "SiriKit",
                            "com.apple.developer.pass-type-identifiers": "Wallet",
                            "com.apple.external-accessory.wireless-configuration": "Wireless Accessory Configuration",
                            "com.apple.developer.default-data-protection": "Data Protection",
                            "com.apple.developer.ubiquity-kvstore-identifier": "iCloud",
                            "com.apple.developer.icloud-services": "iCloud"
                        }
                    },
                    upload_action: "Add Provisioning Profile(s)",
                    upload_instructions: "Click here or Drag & Drop to upload",
                    no_name_for_file: "No name for file",
                    no_prov_profiles_added_yet: "No provisioning profiles added yet.",
                    invalid_file_type: "Invalid file type! Select a .provisionprofile or .mobileprovision file.",
                    upload_count_limit_reached: "You reached the maximum allowed number of provisioning profile files for this project.",
                    can_only_upload_x_more: "You can only upload <count> more provisioning profile files.",
                    make_protected: {
                        confirm_question: "‘Protected’ will be irreversible after save",
                        confirm_details: "If you choose to make this variable protected no one will be able to reveal the value, you can overwrite the value only by deleting the current one and creating a new one.",
                        confirm_ok: "Make it protected",
                        confirm_cancel: "Cancel"
                    },
                    delete_confirm: {
                        question_short: "Are you sure?",
                        question: "Are you sure you want to delete <provisioning_profile_name>?",
                        yes_title: "Yes, delete",
                        no_title: "Cancel"
                    },
                    delete_all_confirm: {
                        question_short: "Are you sure?",
                        question: "Are you sure you want to delete all provisioning profiles?",
                        yes_title: "Yes, delete",
                        no_title: "Cancel"
                    },
                    load_progress: {
                        in_progress: "Loading, wait a sec..."
                    },
                    get_details_progress: {
                        in_progress: "Loading, wait a sec...",
                        try_again_postfix: " Click here to try again."
                    },
                    get_all_test_devices_of_repository: {
                        in_progress: "Loading, wait a sec..."
                    },
                    validate_certificates: {
                        in_progress: "Loading, wait a sec..."
                    },
                    validate_test_devices: {
                        in_progress: "Loading, wait a sec..."
                    },
                    upload_progress: {
                        in_progress: "Uploading, wait a sec..."
                    },
                    delete_progress: {
                        in_progress: "Deleting, wait a sec..."
                    },
                    delete_all_progress: {
                        in_progress: "Deleting all provisioning profiles, wait a sec..."
                    }
                },
                certificate: {
                    header: {
                        card_title: "Code Signing Certificates",
                        password: "Password",
                        expose_for_pull_requests: "Expose for Pull Requests",
                        expose_for_pr: "Expose for PR",
                        actions: {
                            delete_all: "Delete all"
                        }
                    },
                    article: {
                        details: {
                            team_data_label: "Team",
                            expires_on_label: "Expires on",
                            expired_label: "Expired",
                            multiple_identities: "Multiple identities found. Click here to view them:",
                            show_included_identities_button_label: "Show included Identities"
                        },
                        password_edit: {
                            incorrect_password_notice: "Incorrect password"
                        },
                        actions: {
                            download: "Download",
                            protect: "Make protected",
                            delete: "Delete"
                        },
                        expose: {
                            is_expose: "Expose for Pull Request"
                        }
                    },
                    identities_list_popup: {
                        header: {
                            title: "Included identities for"
                        }
                    },
                    upload_action: "Add a certificate (.p12 file) for code signing",
                    upload_instructions: "Click here or Drag & Drop to upload",
                    no_name_for_file: "No name for file",
                    no_certificates_added_yet: "No certificates added yet.",
                    invalid_file_type: "Invalid file type! Select a .p12 file.",
                    upload_count_limit_reached: "You reached the maximum allowed number of certificate files for this project.",
                    can_only_upload_x_more: "You can only upload <count> more certificate files.",
                    make_protected: {
                        confirm_question: "‘Protected’ will be irreversible after save",
                        confirm_details: "If you choose to make this variable protected no one will be able to reveal the value, you can overwrite the value only by deleting the current one and creating a new one.",
                        confirm_ok: "Make it protected",
                        confirm_cancel: "Cancel"
                    },
                    delete_confirm: {
                        question_short: "Are you sure?",
                        question: "Are you sure you want to delete <certificate_name>?",
                        yes_title: "Yes, delete",
                        no_title: "Cancel"
                    },
                    delete_all_confirm: {
                        question_short: "Are you sure?",
                        question: "Are you sure you want to delete all certificates?",
                        yes_title: "Yes, delete",
                        no_title: "Cancel"
                    },
                    load_progress: {
                        in_progress: "Loading, wait a sec..."
                    },
                    get_details_progress: {
                        in_progress: "Loading, wait a sec...",
                        try_again_postfix: " Click here to try again."
                    },
                    upload_progress: {
                        in_progress: "Uploading, wait a sec..."
                    },
                    delete_progress: {
                        in_progress: "Deleting, wait a sec..."
                    },
                    delete_all_progress: {
                        in_progress: "Deleting all certificates, wait a sec..."
                    },
                    show_password: "Show password",
                    change_password_save: "Save",
                    change_password_cancel: "Cancel",
                    change_password_progress: {
                        in_progress: "Change password, wait a sec..."
                    }
                },
                generic_file: {
                    header: {
                        card_title: "Generic File Storage",
                        expose_for_pull_requests: "Expose for Pull Requests",
                        expose_for_pr: "Expose for PR"
                    },
                    article: {
                        actions: {
                            download: "Download",
                            protect: "Make protected",
                            delete: "Delete"
                        }
                    },
                    expose: {
                        is_expose: "Expose for Pull Request"
                    },
                    file_storage_id: "File Storage ID",
                    download_url: "Download URL",
                    upload_action: "Upload file (max. <maximum_file_size_in_megabytes> MB)",
                    upload_instructions: "Add a <strong>File Storage ID</strong> before uploading a file",
                    download_url_available_as: "Download URL available as",
                    id_specified: "the ID you specify",
                    uploaded_file_placeholder: "Enter a unique ID",
                    no_name_for_file: "No name for file",
                    load_progress: {
                        in_progress: "Loading, wait a sec..."
                    },
                    env_var_details: "Download URL will be available as the Environment Variable:",
                    id_not_unique: "Specified ID is not unique.",
                    invalid_id_preview_placeholder: "<Invalid ID>",
                    invalid_id_characters: "Invalid ID. Only 'a-z', 'A-Z', '0-9' and '_' characters are allowed.",
                    id_not_specified: "ID not specified. Enter a unique ID.",
                    id_reserved_for_keystore: "This ID is reserved for the Android Keystore file upload.",
                    enter_id: "Enter an ID for the file's download URL.",
                    upload_count_limit_reached: "You reached the maximum allowed number of generic files for this project.",
                    make_protected: {
                        confirm_question: "‘Protected’ will be irreversible after save",
                        confirm_details: "If you choose to make this variable protected no one will be able to reveal the value, you can overwrite the value only by deleting the current one and creating a new one.",
                        confirm_ok: "Make it protected",
                        confirm_cancel: "Cancel"
                    },
                    delete_confirm: {
                        question_short: "Are you sure?",
                        question: "Are you sure you want to delete <file_name>?",
                        yes_title: "Yes, delete",
                        no_title: "Cancel"
                    },
                    upload_progress: {
                        in_progress: "Uploading, wait a sec..."
                    },
                    delete_progress: {
                        in_progress: "Deleting, wait a sec..."
                    }
                },
                android_keystore: {
                    header: {
                        card_title: "Android Keystore file",
                        expose_for_pull_requests: "Expose for Pull Requests",
                        expose_for_pr: "Expose for PR"
                    },
                    article: {
                        actions: {
                            download: "Download",
                            protect: "Make protected",
                            delete: "Delete"
                        }
                    },
                    expose: {
                        is_expose: "Expose for Pull Request"
                    },
                    no_keystore_file: "No keystore file added yet.",
                    download_url_available_as: "Download URL available as",
                    no_name_for_file: "No name for file",
                    upload_action: "Upload file (max. <maximum_file_size_in_megabytes> MB)",
                    upload_instructions: "Click here or Drag & Drop to upload",
                    load_progress: {
                        in_progress: "Loading, wait a sec..."
                    },
                    upload_progress: {
                        in_progress: "Uploading, wait a sec..."
                    },
                    delete_progress: {
                        in_progress: "Deleting, wait a sec..."
                    },
                    keystore_password_as: "Keystore password will be available as Environment Variable",
                    keystore_alias_as: "Keystore alias will be available as Environment Variable",
                    private_key_password_as: "Private key password will be available as Environment Variable",
                    show_password: "Show password?",
                    show_alias: "Show alias?",
                    show_private_key_password: "Show private key password?",
                    password_placeholder: "Enter password",
                    alias_placeholder: "Enter alias",
                    private_key_password_placeholder: "Enter private key password",
                    save_metadata: "Save metadata",
                    reset_to_saved: "Reset to saved",
                    metadata_invalid_or_not_specified: "Metadata invalid or not fully specified.",
                    password_not_specified: "password not specified",
                    alias_not_specified: "alias not specified",
                    private_key_password_not_specified: "private key password not specified",
                    make_protected: {
                        confirm_question: "‘Protected’ will be irreversible after save",
                        confirm_details: "If you choose to make this variable protected no one will be able to reveal the value, you can overwrite the value only by deleting the current one and creating a new one.",
                        confirm_ok: "Make it protected",
                        confirm_cancel: "Cancel"
                    },
                    delete_confirm: {
                        question_short: "Are you sure?",
                        question: "Are you sure you want to delete <file_name>?",
                        yes_title: "Yes, delete",
                        no_title: "Cancel"
                    },
                    save_metadata_progress: {
                        in_progress: "Saving metadata, wait a sec...",
                        success: "Keystore metadata successfully saved!"
                    }
                }
            },
            env_vars: {
                alert_make_it_protected_popup: {
                    title: "‘Protected’ will be irreversible after save",
                    details: "If you choose to make this variable protected no one will be able to reveal the value, you can overwrite the value only by deleting the current one and creating a new one.",
                    ok_button_title: "Got it"
                },
                load_progress: {
                    in_progress: "Loading, wait a sec..."
                },
                get_secret_env_value_progress: {
                    in_progress: "Loading, wait a sec..."
                },
                add_new: "Add new",
                replace_variables_label: "Replace variables in inputs?",
                expose_for_pr_label: "Expose for Pull Requests?",
                expose_for_pr_popover_content: "You can decide which secrets should be exposed for / available in Pull Request builds.<br> Be careful, exposing a secret is a potential security risk.",
                invalid_env_var_key: "invalid Environment Variable key. Should not be empty, should only contain uppercase, lowercase letters, numbers, underscores, should not begin with a number",
                one_or_more_invalid_env_var_key: "one or more Environment Variable has an invalid key. Keys should not be empty, should only contain uppercase, lowercase letters, numbers, underscores, should not begin with a number",
                invalid_env_var_value: "invalid Environment Variable value. Should not be empty",
                should_be_unique: "should be unique",
                key_placeholder: "Key",
                value_placeholder: "Value",
                warn: {
                    title: "You should <strong>not</strong> add private information here.",
                    detail: "These Environment Variables will also be available in builds triggered by pull requests and bitrise.yml. For private info use",
                    button_title: "Secrets"
                },
                actions: {
                    make_it_protected: "Make it protected",
                    save: "Save",
                    delete_env_var: "Delete",
                    show_value: "Show value?",
                    cancel: "Cancel"
                },
                secrets: {
                    title: "Secret Environment Variables",
                    warn: {
                        title: "Your secrets are safe with us",
                        detail_1: "Your secrets are not shown in the bitrise.yml",
                        detail_2: "Your secrets are stored encrypted",
                        detail_3: "You can prevent exposing secrets on the UI by making them protected",
                        detail_4: "Note that anyone might be able to do a workaround and log the value of secrets with a pull request, thus we advise <strong>not to expose secrets in PRs</strong>"
                    },
                    edit: "Edit",
                    make_protected: {
                        confirm_question: "'Protected' will be irreversible after save",
                        confirm_details: "If you choose to make this variable protected no one will be able to reveal the value, you can overwrite the value only by deleting the current one and creating a new one.",
                        confirm_ok: "Make it protected",
                        confirm_cancel: "Cancel"
                    },
                    delete: {
                        confirm_question: "Are you sure?",
                        confirm_details: "Are you sure you want to delete this secret? This cannot be undone.",
                        confirm_ok: "Delete",
                        confirm_cancel: "Cancel"
                    },
                    save: {
                        in_progress: "Saving secret, wait a sec..."
                    }
                },
                app: {
                    title: "Project Environment Variables",
                    notification: "Project Environment Variables will also be available in builds triggered by pull requests. You should NOT add any private information here."
                },
                workflow: {
                    title_postfix: "Workflow Environment Variables",
                    notification: "You can specify Env Vars which will only be available for the steps in your <workflow_id> Workflow."
                }
            },
            triggers: {
                update_deprecated_popup: {
                    title: "Triggers are changing for the better",
                    details_1: "We're converting your current trigger maps to the new format, to enable specifying Pushes and Pull Requests separately, as well as setting the source and target branch for PRs. You don't have to worry, though, everything you've set so far will work the same!",
                    details_2: "For more information, please check the <a href='<url>' target='_blank'>blogpost</a>!"
                }
            },
            stack: {
                load_stacks_progress: {
                    in_progress: "Loading, wait a sec..."
                },
                workflow_id_postfix: " workflow",
                default_stack: "Default (<stack_name>)",
                default: "default",
                more_info_about: "See what software is installed on this stack",
                more_info_about_applesilicon: "See what software is installed on this stack: <a href='<url>' target='_blank'>Intel</a> / <a href='<url>' target='_blank'>Apple Silicon</a>",
                stack_update_policy: "Read more about the <a href='https://devcenter.bitrise.io/en/infrastructure/build-stacks/stack-update-policy.html' target='_blank'>Stack Update Policy</a>.",
                docker_image_to_use: "Docker image to use",
                incompatible_stack: "Your current stack is not compatible with your current project type! Select a different stack from the list below.",
                invalid_stack: "Your current stack is invalid! Choose another stack from the list below.",
                default_stack_settings: {
                    header_title: "Default Stack",
                    header_description: "This will appear as a default stack in your workflows."
                },
                workflow_specific_settings: {
                    header_title: "Workflow Specific Stacks",
                    header_description: "This will appear as a default stack in your workflows."
                },
                machine_type_notes: {
                    gen1: "The tried and tested machines that have been serving our customers for many years now",
                    gen2: "These machines run on a new hardware generation, offering improved performance compared to Gen1 hardware"
                },
                rollback_version: {
                    not_available: "Previous version is not available",
                    use: "Use previous version",
                    enable_if: "Enable this option if your build is failing after a Bitrise Stack Update. Your build will start slower while using rollback stack versions.",
                    usage_warning: "Previous version is a rollback option we provide if your build is failing after a Stack Update. Please keep in mind that this option is only available for a limited time, usually 2-3 days after a Stack Update. Once removed, your build will run on the latest Stable Stack.",
                    usage_warning_link_text: "Learn more",
                    usage_warning_link_href: "https://devcenter.bitrise.io/en/infrastructure/build-stacks/stack-update-policy.html#using-the-previous-version-of-a-stack",
                    invalid_version_title: "Invalid rollback version",
                    invalid_version_message: "The rollback version specified in your bitrise.yml is no longer available. New builds will use the current stack version. You should update your bitrise.yml accordingly."
                }
            },
            machine_type: {
                workflow_specific_settings: {
                    header_title: "Available Machine Types for this Stack"
                },
                learn_more_about: "Learn more about Machine types »",
                invalid_set_in_bitrise_yml_meta: "Invalid machine type set in bitrise.yml meta"
            },
            licenses: {
                lead: "You can run your builds on Bitrise machines relying on license pools. For more info, visit the <a href='https://devcenter.bitrise.io/en/getting-started/unity-on-bitrise.html' target='_blank'>DevCenter.</a>",
                card: {
                    header_title: 'Workflow-specific license pools',
                    header_description: 'Your workflow-specific builds will run utilizing the selected pool.'
                }
            },
            yml: {
                title_editor: "bitrise.yml editor",
                title: "bitrise.yml",
                info_1: "You can edit your current config in YAML format:",
                info_1_repo_yml: "The content of the bitrise.yml file, fetched from the app's repository.",
                download: "Download currently saved config",
                load_progress: {
                    loading: "Loading, wait a sec..."
                },
                warn: {
                    title: "Uups, we found some warnings in your configuration, please consider checking them."
                },
                store_in_repository: {
                    loading: "Looking for bitrise.yml in the app repository...",
                    not_found: "Couldn't find the bitrise.yml file in the app's repository. Please make sure that the file exists on the default branch and the app's Service Credential User has read rights on that.",
                    validation_loading: "Validating bitrise.yml in the app repository...",
                    validation_error: "The bitrise.yml file in the repository seems invalid. Please review and fix it before proceeding. Read more about the",
                    success: "Successfully changed the bitrise.yml storage setting! The next build will use the bitrise.yml file in the app's repository."
                },
                store_on_website: {
                    loading: "Creating bitrise.yml on bitrise.io...",
                    success: "Successfully changed the bitrise.yml storage setting! The next build will use the bitrise.yml file stored on bitrise.io."
                },
            },
            image_service: {
                broken_image: "Broken image: <image_url>.",
                load_error: "Error loading image: <image_url>."
            },
            request_service: {
                response: {
                    default_error: "Error during request."
                },
                step_config_fetch: {
                    default_error: "Error loading step <step_yml_url>.",
                    not_supported_host: "This host (<step_yml_url>) is not supported for step.yml load.",
                    github_error: "Could not load <step_yml_url> from GitHub. Make sure the repository is publicly accessible. Error: <error>"
                },
                libraries_fetch: {
                    default_error: "Error loading library",
                    error_prefix: "Error loading library: "
                },
                load_app_config: {
                    invalid_bitrise_yml_error: "Your config (bitrise.yml) is invalid.",
                    default_error: "Error loading app config.",
                    error_prefix: "Error loading app config: "
                },
                load_default_outputs: {
                    default_error: "Error loading default outputs.",
                    error_prefix: "Error loading default outputs: "
                },
                get_pipeline_config: {
                    default_error: "Error loading pipeline config.",
                    error_prefix: "Error loading pipeline config: ",
                    not_website_mode_error: "Getting pipeline config is only available in website mode"
                },
                load_secrets: {
                    default_error: "Error loading secrets.",
                    error_prefix: "Error loading secrets: "
                },
                save_app_config: {
                    default_error: "Error saving CI config.",
                    error_prefix: "Error saving CI config: "
                },
                load_prov_profiles: {
                    default_error: "Error loading provisioning profiles.",
                    error_prefix: "Error loading provisioning profiles: "
                },
                load_certificates: {
                    default_error: "Error loading certificates.",
                    error_prefix: "Error loading certificates: "
                },
                load_generic_files: {
                    default_error: "Error loading files.",
                    error_prefix: "Error loading files: "
                },
                load_keystore_file: {
                    default_error: "Error loading files.",
                    error_prefix: "Error loading files: "
                },
                create_prov_profile: {
                    default_error: "Error uploading provisioning profile.",
                    error_prefix: "Error uploading provisioning profile: "
                },
                create_certificate: {
                    default_error: "Error uploading certificate.",
                    error_prefix: "Error uploading certificate: "
                },
                create_generic_file: {
                    default_error: "Error uploading file.",
                    error_prefix: "Error uploading file: "
                },
                create_keystore_file: {
                    default_error: "Error uploading file.",
                    error_prefix: "Error uploading file: "
                },
                get_current_user_data: {
                    default_error: "Error getting current user data",
                    error_prefix: "Error getting current user data: ",
                    not_website_mode_error: "Getting current user data is only available in website mode"
                },
                get_current_user_metadata: {
                    default_error: "Error getting current user metadata",
                    error_prefix: "Error getting current user metadata: ",
                    not_website_mode_error: "Getting current user metadata is only available in website mode"
                },
                put_current_user_metadata: {
                    default_error: "Error updating current user metadata",
                    error_prefix: "Error updating current user metadata: ",
                    not_website_mode_error: "Updating current user metadata is only available in website mode"
                },
                get_product_tour_data: {
                    default_error: "Error getting current product tour data",
                    error_prefix: "Error getting product tour data: ",
                    not_website_mode_error: "Getting product tour data is only available in website mode"
                },
                get_codesigndoc_bash_script: {
                    default_error: "Error getting codesigndoc bash command",
                    error_prefix: "Error getting codesigndoc bash command: ",
                    not_website_mode_error: "Getting codesigndoc bash command is only available in website mode"
                },
                get_apple_developer_account_data_from_database: {
                    default_error: "Error getting connected Apple Developer account data",
                    error_prefix: "Error getting connected Apple Developer account data: ",
                    not_website_mode_error: "Getting connected Apple Developer account data is only available in website mode"
                },
                get_details_of_prov_profile: {
                    default_error: "Error getting details of uploaded provisioning profile.",
                    error_prefix: "Error getting details of uploaded provisioning profile: ",
                    not_website_mode_error: "Provisioning profile detail fetch is only available in website mode"
                },
                get_details_of_certificate: {
                    default_error: "Error getting details of uploaded certificate file.",
                    error_prefix: "Error getting details of uploaded certificate file: ",
                    not_website_mode_error: "Certificate detail fetch is only available in website mode"
                },
                finalize_prov_profile_upload: {
                    default_error: "Error finalizing provisioning profile upload.",
                    error_prefix: "Error finalizing provisioning profile upload: "
                },
                finalize_certificate_upload: {
                    default_error: "Error finalizing certificate upload.",
                    error_prefix: "Error finalizing certificate upload: "
                },
                finalize_generic_file_upload: {
                    default_error: "Error finalizing file upload.",
                    error_prefix: "Error finalizing file upload: "
                },
                finalize_keystore_file_upload: {
                    default_error: "Error finalizing file upload.",
                    error_prefix: "Error finalizing file upload: "
                },
                update_app_with_apple_credential: {
                    default_error: "Error saving Apple Credential User for app",
                    error_prefix: "Error saving Apple Credential User for app: ",
                    not_website_mode_error: "Saving Apple Credential User for app is only available in website mode"
                },
                update_prov_profile_is_expose_state: {
                    default_error: "Error updating Expose for Pull Requests state.",
                    error_prefix: "Error updating Expose for Pull Requests state: "
                },
                protect_prov_profile: {
                    default_error: "Error setting provisioning profile to protected.",
                    error_prefix: "Error setting provisioning profile to protected: "
                },
                protect_certificate: {
                    default_error: "Error setting certificate to protected.",
                    error_prefix: "Error setting certificate to protected: "
                },
                protect_keystore_file: {
                    default_error: "Error setting keystore file to protected.",
                    error_prefix: "Error setting keystore file to protected: "
                },
                protect_generic_file: {
                    default_error: "Error setting file to protected.",
                    error_prefix: "Error setting file to protected: "
                },
                update_certificate_is_expose_state: {
                    default_error: "Error updating Expose for Pull Requests state.",
                    error_prefix: "Error updating Expose for Pull Requests state: "
                },
                update_generic_file_is_expose_state: {
                    default_error: "Error updating Expose for Pull Requests state.",
                    error_prefix: "Error updating Expose for Pull Requests state: "
                },
                update_keystore_file_is_expose_state: {
                    default_error: "Error updating Expose for Pull Requests state.",
                    error_prefix: "Error updating Expose for Pull Requests state: "
                },
                save_keystore_file_metadata: {
                    default_error: "Error saving metadata.",
                    error_prefix: "Error saving metadata: "
                },
                upload_file_to_storage: {
                    default_error: "Error uploading file to storage."
                },
                delete_apple_developer_account_data_from_database: {
                    default_error: "Error deleting connected Apple Developer account data",
                    error_prefix: "Error deleting connected Apple Developer account data: ",
                    not_website_mode_error: "Deleting connected Apple Developer account data is only available in website mode"
                },
                delete_prov_profile: {
                    default_error: "Error removing provisioning profile.",
                    error_prefix: "Error removing provisioning profile: "
                },
                delete_all_prov_profiles: {
                    default_error: "Error removing all provisioning profiles.",
                    error_prefix: "Error removing all provisioning profiles: "
                },
                delete_certificate: {
                    default_error: "Error removing certificate.",
                    error_prefix: "Error removing certificate: "
                },
                delete_all_certificates: {
                    default_error: "Error removing all certificates.",
                    error_prefix: "Error removing all certificates: "
                },
                delete_generic_file: {
                    default_error: "Error removing file.",
                    error_prefix: "Error removing file: "
                },
                delete_keystore_file: {
                    default_error: "Error removing file.",
                    error_prefix: "Error removing file: "
                },
                save_apple_developer_account_data_to_database_and_authenticate: {
                    default_error: "Error connecting to Apple Developer Portal",
                    error_prefix: "Error connecting to Apple Developer Portal: ",
                    not_website_mode_error: "Connecting to Apple Developer Portal is only available in website mode",
                    pla_error: "The team’s Admin needs to accept the latest Program License Agreement rider, which can be reviewed in their developer account."
                },
                save_certificate_password: {
                    default_error: "Error saving certificate password.",
                    error_prefix: "Error saving certificate password: "
                },
                save_secrets: {
                    default_error: "Error saving secrets.",
                    error_prefix: "Error saving secrets: "
                },
                get_app_data: {
                    default_error: "Error loading app data.",
                    error_prefix: "Error loading app data: "
                },
                get_machine_types: {
                    default_error: "Error loading machine types.",
                    error_prefix: "Error loading machine types: ",
                    not_website_mode_error: "Machine Types get is only available in website mode."
                },
                get_stack: {
                    default_error: "Error loading stack.",
                    error_prefix: "Error loading stack: ",
                    not_website_mode_error: "Stack get is only available in website mode."
                },
                get_stacks: {
                    default_error: "Error loading stacks.",
                    error_prefix: "Error loading stacks: ",
                    not_website_mode_error: "Stacks get is only available in website mode."
                },
                get_all_test_devices_of_repository: {
                    default_error: "Error getting test devices of specified repository.",
                    error_prefix: "Error getting test devices of specified repository: ",
                    not_website_mode_error: "Fetching of all test devices of repository is only available in website mode"
                },
                get_secret_environment_value: {
                    default_error: "Error getting secret environment value.",
                    error_prefix: "Error getting secret environment value: ",
                    not_website_mode_error: "Getting secret environment value is only available in website mode"
                },
                post_apple_developer_account_two_step_auth_select_device: {
                    default_error: "Error selecting a trusted device",
                    error_prefix: "Error selecting a trusted device: ",
                    not_website_mode_error: "Selecting a trusted device is only available in website mode"
                },
                post_apple_developer_account_verify_code: {
                    default_error: "Error validating verification code",
                    error_prefix: "Error validating verification code: ",
                    not_website_mode_error: "Validating verification code is only available in website mode"
                },
                post_apple_developer_account_default_team: {
                    default_error: "Error saving selected development team for app",
                    error_prefix: "Error saving selected development team for app: ",
                    not_website_mode_error: "Saving selected development team for app is only available in website mode"
                },
                get_org_plan_data: {
                    default_error: "Error getting organization subscription status",
                    error_prefix: "Error getting organization subscription status: ",
                    not_website_mode_error: "Getting organization subscription status is only available in website mode"
                },
                post_start_build: {
                    default_error: "Error starting a build",
                    error_prefix: "Error starting a build: ",
                    not_website_mode_error: "Starting a build is only available in website mode"
                }
            },
            step_source_service: {
                step_from_cvs: {
                    no_path: "Path not specified.",
                    no_git_url: "Git URL not specified.",
                    no_library: "Step library not specified.",
                    no_id: "Step ID not specified.",
                    no_step_with_id_error_prefix: "Step with ID not found in library: ",
                    no_step_with_version_error_prefix: "Step with version not found in library: "
                },
                load_library: {
                    default_error: "Error loading library."
                },
                get_library_for_step: {
                    default_error: "Library not found for step"
                }
            }
        },
        routes: {
            endpoints: {
                workflows: "workflows",
                pipelines: "pipelines",
                code_signing: "code_signing",
                secrets: "secrets",
                env_vars: "env_vars",
                triggers: "triggers",
                stack: "stack",
                licenses: "licenses",
                yml: "yml"
            },
            templates: {
                workflows: "templates/workflows.html",
                pipelines: "templates/pipelines.html",
                code_signing: "templates/code_signing.html",
                secrets: "templates/secrets.html",
                env_vars: "templates/env_vars.html",
                triggers: "templates/triggers.html",
                stack: "templates/stack.html",
                licenses: "templates/licenses.html",
                yml: "templates/yml.html",
                workflows_workflow_description: "templates/workflows-workflow_description.html",
                add_step_sidebar: "templates/add_step_sidebar.html",
                add_step_sidebar_step: "templates/add_step_sidebar_step.html"
            },
            website: {
                dashboard_path: "/dashboard",
                workspace_secrets_path: "/workspaces/<workspace_slug>/settings/shared-resources",
                workspace_plan_selector_path: "/organization/<workspace_slug>/credit_subscription/plan_selector_page",
                app_path: "/app/<app_slug>",
                app_path_get: "/app/<app_slug>.json",
                app_start_build_path: "/app/<app_slug>/build/start.json",
                app_data_get: "/api/app/<app_slug>.json",
                app_update: "/api/app/<app_slug>.json",
                app_config_post: "/api/app/<app_slug>/config.json",
                app_config_get: "/api/app/<app_slug>/config.json",
                app_codesigndoc_script_get: "/api/app/<app_slug>/codesigndoc.json'",
                current_user_get: "/me/profile.json",
                product_tour_shown_get: "/api/app/<app_slug>/product_tour_shown",
                current_user_beta_tags_get: "/me/profile/beta_tags.json",
                current_user_metadata_get: "/me/profile/metadata.json?key=<metadata_key>",
                current_user_metadata_put: "/me/profile/metadata.json",
                get_org_plan_data: "/organization/<org_slug>/payment_subscription_status",
                yml_post: "/api/app/<app_slug>/config.json",
                yml_get: "/api/app/<app_slug>/config.yml",
                yml_download: "/api/app/<app_slug>/config.yml?is_download=1",
                secrets_post: "/api/app/<app_slug>/secrets-without-values",
                secrets_get: "/api/app/<app_slug>/secrets-without-values",
                pipeline_config_get: "/app/<app_slug>/pipeline_config",
                secret_value_get: "/api/app/<app_slug>/secrets/<secret_key>.json",
                bitrise_steplib_get: "https://bitrise-steplib-collection.s3.amazonaws.com/spec.json.gz",
                default_outputs_get: "/api/app/<app_slug>/default_step_outputs.json",
                machine_type_configs_get: "/app/<app_slug>/machine_type_configs",
                stack_get: "/app/<app_slug>/stack",
                stacks_get: "/app/<app_slug>/all_stack_info",
                prov_profile_create: "/api/app/<app_slug>/prov_profile_document/create.json",
                prov_profile_get_details: "/prov_profile_document/details/<prov_profile_id>.json",
                prov_profiles_get: "/api/app/<app_slug>/prov_profile_document/show.json",
                prov_profile_download: "/prov_profile_document/<prov_profile_id>",
                prov_profile_finalize_upload: "/prov_profile_document/<prov_profile_id>/upload_ended.json",
                prov_profile_is_expose_state_update: "/prov_profile_document/<prov_profile_id>/update_is_expose.json",
                prov_profile_protect: "/prov_profile_document/<prov_profile_id>/protect.json",
                prov_profile_delete: "/api/app/<app_slug>/prov_profile_document/<prov_profile_id>/delete.json",
                prov_profiles_delete_all: "/api/app/<app_slug>/prov_profile_document/delete.json",
                certificate_create: "/api/app/<app_slug>/build_certificate/create.json",
                certificate_finalize_upload: "/build_certificate/<certificate_id>/upload_ended.json",
                certificates_get: "/api/app/<app_slug>/build_certificate/show.json",
                certificate_download: "/build_certificate/<certificate_id>",
                certificate_get_details: "/build_certificate/details/<certificate_id>.json",
                certificate_is_expose_state_update: "/build_certificate/<certificate_id>/update_is_expose.json",
                certificate_password_save: "/build_certificate/<certificate_id>/password.json",
                certificate_protect: "/build_certificate/<certificate_id>/protect.json",
                certificate_delete: "/api/app/<app_slug>/build_certificate/<certificate_id>/delete.json",
                certificates_delete_all: "/api/app/<app_slug>/build_certificate/delete.json",
                generic_file_create: "/api/app/<app_slug>/project_file_storage_document/create.json",
                generic_file_finalize_upload: "/project_file_storage_document/<generic_file_id>/upload_ended.json",
                generic_files_get: "/api/app/<app_slug>/project_file_storage_document/show.json",
                generic_file_is_expose_state_update: "/project_file_storage_document/<generic_file_id>/update_is_expose.json",
                generic_file_download: "/project_file_storage_document/<generic_file_id>",
                generic_file_protect: "/project_file_storage_document/<generic_file_id>/protect.json",
                generic_file_delete: "/api/app/<app_slug>/project_file_storage_document/<generic_file_id>/delete.json",
                keystore_file_metadata_save: "/project_file_storage_document/<keystore_file_id>/exposed_meta.json",
                team_test_devices: "/api/app/<app_slug>/team-test-devices.json",
                apple_developer_account_get: "/me/profile/apple_developer_account.json",
                apple_developer_account_connect: "/me/profile/apple_developer_account.json",
                apple_developer_account_connection_delete: "/me/profile/apple_developer_account.json",
                apple_developer_account_two_step_auth_select_device_post: "/me/profile/apple_developer_account/two_step_auth_select_device.json",
                apple_developer_account_two_step_auth_verify_code_post: "/me/profile/apple_developer_account/two_step_auth_verify_code.json",
                apple_developer_account_two_factor_auth_verify_code_post: "/me/profile/apple_developer_account/two_factor_auth_verify_code.json",
                apple_developer_account_default_team_post: "/me/profile/apple_developer_account/default_team.json",
                workflows_and_pipelines: "/app/<app_slug>/workflows-and-pipelines",
                get_org_beta_tags: "/organization/<org_slug>/beta_tags",
                user_auth_tokens: "/me/profile/security/user_auth_tokens",
                app_setting_code_signing: "/app/<app_slug>/settings/code-signing"

            },
            local_server: {
                cancel_api_connection_close: "/api/connection",
                close_api_connection: "/api/connection",
                app_config_post: "/api/bitrise-yml.json",
                app_config_get: "/api/bitrise-yml.json",
                yml_post: "/api/bitrise-yml",
                yml_get: "/api/bitrise-yml",
                secrets_post: "/api/secrets",
                secrets_get: "/api/secrets",
                libraries_fetch: "/api/spec",
                step_config_fetch: "/api/step-info",
                default_outputs_get: "/api/default-outputs"
            },
            devcenter: {
                bitrise_cli: "https://devcenter.bitrise.io/en/bitrise-cli.html",
                env_var_is_expand: "https://devcenter.bitrise.io/getting-started/getting-started-steps/#environment-variables-as-step-inputs",
                m1_stacks: "https://devcenter.bitrise.io/en/infrastructure/build-stacks/apple-silicon-m1-stacks"
            },
            blog: {
                new_triggers: "http://blog.bitrise.io/2016/09/23/do-more-with-triggers.html"
            },
            other: {
                bitrise_available_stacks: "http://devcenter.bitrise.io/infrastructure/available-stacks",
                bitrise_workflow_editor_source_code: "https://github.com/bitrise-io/bitrise-workflow-editor",
                github_step_yml_path: "https://raw.githubusercontent.com/<step_path>/<step_version>/step.yml"
            }
        }
    }
end
