use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use chrono::prelude::*;


declare_id!("5ZyEtGMcQrRWyg4m67hDSav5taWvAjEcfJHdtfSm9BVy");

#[program]
pub mod crowdfunding {
    use super::*;

    pub fn create(ctx: Context<Create>, name: String, description: String, due_date: String, sum_required: u64, date_created: String, is_locked: String) -> Result<()> {
        let fund = &mut ctx.accounts.fund;
        fund.name = name;
        fund.description = description;
        fund.due_date = due_date;
        fund.date_created = time::now();
        fund.sum_donated = 0;
        fund.sum_required = sum_required;
        fund.is_active = true;
        fund.is_locked = is_locked;
        fund.creator = *ctx.accounts.user.key;
        Ok(())
    }

    pub fn withdrawAll(ctx: Context<Withdraw>) -> ProgramResult {
        let fund = &mut ctx.accounts.fund;

        let amount = **fund.to_account_info().lamports.borrow();
        fund.is_active = false;
        
        withdraw(ctx, amount);
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> ProgramResult {
        let fund = &mut ctx.accounts.fund;
        let user = &mut ctx.accounts.user;

        if *user.key != fund.creator {
            return Err(ProgramError::InvalidAccountData);
        }

        let current_date = Utc::now().naive_utc();
        let unlock_date = NaiveDate::parse_from_str(fund.due_date, "%d.%m.%Y")?;

        if fund.is_locked && current_date > unlock_date {
            return Err(ProgramError::InvalidArgument);
        }

        let balance = **fund.to_account_info().lamports.borrow();
        if amount < balance {
            let rent_balance = Rent::get()?.minimum_balance(fund.to_account_info().data_len());
            if balance - rent_balance < amount {
                return Err(ProgramError::InsufficientFunds);
            }
        }

        **fund.to_account_info().try_borrow_mut_lamports()? -= amount;
        **user.to_account_info().try_borrow_mut_lamports()? += amount;

        fund.sum_donated = **fund.to_account_info().lamports.borrow();
        Ok(())
    }
    
    pub fn donate(ctx: Context<Donate>, amount: u64) -> ProgramResult {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.fund.key(),
            amount
        );

        let _result = anchor_lang::solana_program::program::invoke(&ix, 
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.fund.to_account_info()
            ]
        );

        (&mut ctx.accounts.fund).sum_donated += amount;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(init, payer=user, space=9000, seeds=[b"CROWDFUNDING".as_ref(), user.key().as_ref(), seed_name.as_ref()], bump)]
    pub fund: Account<'info, Fund>,
    #[account(mut)]
    pub user: Signer<'info>,
    system_program: Program<'info, System>,
    seed_name: String
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub fund: Account<'info, Fund>,
    #[account(mut)]
    pub user: Signer<'info>
}

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub fund: Account<'info, Fund>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[account]
pub struct Fund {
    pub creator: Pubkey,
    pub name: String,
    pub description: String,
    pub due_date: String,
    pub date_created: String,
    pub sum_donated: u64,
    pub sum_required: u64,
    pub is_active: bool,
    pub is_locked: bool,
}


